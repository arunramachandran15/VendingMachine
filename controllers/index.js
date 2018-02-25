var models = require('../models');
var async = require('async');
var _ = require('underscore');

var self = module.exports = {

	list : function(req, res, next)	{
		var user = {};
		models.get_product(user,function(err,data){
			res.send({
				status : 200,
				status_message : "Success Listing chocolates",
				data : data
			});
		})
	},

	get_transactions : function(req,res,next){

		var type = req.body.type

		models.get_transactions(type,function(err,data){
			res.send({
				status : 200,
				status_message : type + " transactions",
				data : data
			});
		})
	},

	buy_chocolate : function(req, res, next)	{



		var request = req.body;
		var shortcode = request.shortcode;
		var key_code = request.key_code;
		var req_den = request.denominations;

		var amount_paid = (req_den['50']*50) + (req_den['20']*20) +(req_den['10']*10);
		request.amount_paid = amount_paid;

		console.log(amount_paid)
		var db_data;
		async.auto({
			get_product : function(callback)	{
				models.get_product(key_code,callback)
			},
			validation : ['get_product', function(callback, result)	{
				console.log("get_product")
				console.log(result.get_product)
				if(result.get_product.length > 0){
					var product_price = result.get_product[0].price;
					var change = amount_paid - product_price;
					if(change < 0)
						callback("In sufficient Amount, Giving back the money",null);
					else{
						callback(null,{difference : change})
					}
				}else{
					callback("Given Product Not available",null);
				}
			}],
			get_denominations : ['validation', function(callback, results)	{

				var change_amount =  results.validation;
				models.get_denominations(change_amount,callback);

			}],
			calculate_change : ['get_denominations', function(callback, results)	{
				self.getChange(results,req,callback);
			}],
			do_transaction : ['calculate_change', function(callback, results)	{
				
				if(results.get_denominations.length>0){
					db_data = self.getDB_data(results,request);
					console.log(db_data.transaction)
					models.do_transaction(db_data,request,callback)
					console.log("do_transaction")
				}else{
					callback("oops something went wrong",null)
				}
			}],
			
		},function(err, results)	{
			console.log("Async Response place")
			var response ;
			console.log(err)
			console.log(results)
			if(err){
				response = {
					status : 401,
					status_message : err,
				}
			}else{
				response = {
					status : 200,
					status_message : "Transaction successful",
					product : {
						shortcode : results.get_product[0].shortcode,
						quantity : results.get_product[0].slot_quantity-1,
						unit_price : results.get_product[0].price,
						inventory : results.get_product[0].product_quantity
					},
					amount_paid :amount_paid,
					change : results.calculate_change.change_denominations,
					available_denominations : results.calculate_change.available_denominations
				}
			}
			res.send(response);
		})
	},

	getChange : function(results,req,callback){

				var difference = results.validation.difference;
				var mov_difference = difference;
				var avl_denom = results.get_denominations;

				var res_denom = {} ;
				var new_update_denom = {};
				var req_denom = req.body.denominations;

				_.each(avl_denom,function(row){
					var key = row.denomination
					//console.log(key)
					//console.log(row)
					new_update_denom[key] = row.quantity;
					if(req_denom[key])
						new_update_denom[key] = new_update_denom[key] + req_denom[key];
					if(difference == 0){
						//new_update_denom[key] = new_update_denom[key]+req_denom[key];
						res_denom = {};
						mov_difference = 0;
					}
					else{
						console.log("row[key]:"+row.quantity);
						if(row.denomination <= difference){
							console.log("row[key]:"+row.quantity)
							if(row.quantity > 0){
								count= Math.floor(mov_difference/key);
								console.log("key : "+key+" count : "+count+" avl_quantity : "+row.quantity)
								if(count <= row.quantity){
									mov_difference = mov_difference%key;
									new_update_denom[key] = new_update_denom[key]-count;
									res_denom[key] = count		
								}else{
									mov_difference = mov_difference - (key * row.quantity)
									new_update_denom[key] = 0;
									res_denom[key] = row.quantity
								}
							}
						}
					}
					if(isNaN(new_update_denom[key])){
						 new_update_denom[key] =row.quantity 
					}
						
				})
				if(mov_difference == 0){
					callback(null,{
							available_denominations : new_update_denom,
							change_denominations:res_denom
						});
				}else{
					callback("Change not available, Put exact Amount",null);
				}
	},

	getDB_data : function(results,request){

		var DB = {};
		var transaction ;
		var product = results.get_product[0];
		var old_product_quantity = product.product_quantity;
		var currency = results.calculate_change.available_denominations;
		var new_product_quantity = old_product_quantity ; 
		var old_slot_quantity = product.slot_quantity;
		var new_slot_quantity = old_slot_quantity -1; 
		var slot_refill_quantity = 0;
		console.log(new_slot_quantity)
		console.log(old_product_quantity)
		console.log()
		if(new_slot_quantity<=2){
			if(old_product_quantity>=10){
				new_product_quantity = old_product_quantity - (10 - new_slot_quantity);
				new_slot_quantity = 10;
			}else{
				console.log("else")
				if(new_slot_quantity <= 1){
					console.log("Hello")
					/*new_product_quantity = new_slot_quantity
					new_slot_quantity = new_slot_quantity + (old_product_quantity - new_slot_quantity)	*/	

					new_product_quantity = 0;
					new_slot_quantity = old_product_quantity;

				}
			}
		}

		console.log(new_product_quantity + "asdsadasd")
		transaction = {
			product_shortcode : product.shortcode,
			paid_amount : request.amount_paid
		}

		DB = {
			slot : {quantity : new_slot_quantity},
			product : {quantity :new_product_quantity},
			currency : currency,
			transaction : transaction
		}

		return DB;
	}


}