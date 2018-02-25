var knex = require('./connection').knex;
var async = require('async');

var self = module.exports = {


  get_product : function(key_code,callback)  {
    var columns = [

      'name',
      'shortcode',
      'key_code',
      'price',
      'machine_slot.quantity as slot_quantity',
      'product_inventory.quantity as product_quantity',
      'machine_slot.alert_level as slot_alert_level',
      'product_inventory.alert_level as product_alert_level',
      'machine_slot.capacity as slot_capacity'
    ] 
    var query = knex.select(columns).from('product_inventory')
        .innerJoin('machine_slot', 'machine_slot.product_shortcode', 'product_inventory.shortcode')
        .where('machine_slot.quantity','>',0)
        
    console.log(query.toString());

    if(key_code.length > 0){
        query = query.andWhere('machine_slot.key_code',key_code).limit(1)
    }

    query.asCallback(callback)
  },


  get_transactions : function(type,callback)  {
    var query ;
    if(type=="month")
      query = knex.raw('select product_shortcode,to_char(created_at::date, \'MM\') as month ,count(*),sum(paid_amount) as paid_amount from transaction group by month,product_shortcode')
    else if(type=="day")
      query =   knex.raw('select product_shortcode,to_char(created_at, \'DD Mon YYYY\') as date ,count(*),sum(paid_amount) as paid_amount from transaction group by date,product_shortcode')
    else
      query =   knex.raw('select product_shortcode,to_char(created_at, \'HH24\') as time ,count(*),sum(paid_amount) as paid_amount from transaction group by time,product_shortcode')
    console.log(query.toString())
    query.asCallback(function(err,data){
      if(err){
        console.log(err)
      }else(
        console.log(data.rows)
      )
      callback(err,data.rows);

    })
  },

  get_denominations : function(change_amount,callback)  {
    knex.select('*').from('currency')
    .orderBy('denomination','desc')
    .asCallback(callback)
  },


  do_transaction : function(db_data,request,callback)  {
    knex.transaction(function(trx)  {
      async.series({
        prod_inv_update : function(callback){
          console.log("db_data.product")
          console.log(db_data.product)
          self.uproduct_inventory(db_data.product,request,trx,callback)
        },
        machine_slot_inv_update : function(callback){
          self.umachine_slot(db_data.slot,request,trx,callback)
        },
        currency_update : function(callback){
          self.currency_update(db_data.currency,trx,callback)
        },   
        transaction_insert : function(callback){
          console.log(db_data.transaction)
          self.insert_transaction(db_data.transaction,trx,callback)
        }        
      },function(err,data){
          if(err) {
            console.log(err);
            trx.rollback(err)
          } else {
            //console.log(data);
            trx.commit(data)
          }
          callback(err,data);
      })
    })
  },

  uproduct_inventory : function(data,req,trx,callback)  {
    trx.update(data).from('product_inventory')
        .where('shortcode', req.shortcode)
        .asCallback(function(err,data){
          if(err){
            callback(err,data);
          }else{
            callback(null,data);
          }
        })
  },

  umachine_slot : function(data,req,trx,callback)  {
    trx.update(data).from('machine_slot')
        .where('key_code', req.key_code)
        .asCallback(function(err,data){
          if(err){
            callback(err,data);
          }else{
            callback(null,data);
          }
        })
  },

  currency_update : function(data,trx,callback)  {
    console.log(data);
    var async_updates =[]
    for(var denomination in data){
      var update_data = {
        quantity : data[denomination]
      }
      var condition = {
        denomination : denomination
      }
      async_updates.push(self.update_currency(update_data,condition,trx,callback))
    }

      async.parallel(async_updates,function(err,data){
        if(err){
          console.log(err)
           callback(err,data);
        }
        console.log("Currency")
        console.log(err)
        //console.log(data);
        callback(null,"currency update Success");
      })
  },

  insert_transaction : function(data,trx,callback)  {
    data.created_at = new Date();
    data.updated_at = new Date();
    trx.insert(data).into('transaction').asCallback(function(err,data){
          if(err){
            console.log(err)
            trx.rollback(err)
          }else{
            callback(null,data);
          }
        })
  },

  update_currency : function(update_data,condition,trx,callback)  {
    return function(callback){
        trx.update(update_data).from('currency')
        .where(condition)
        .asCallback(function(err,data){
          if(err){
            console.log(err)
            trx.rollback(err)
          }else{
            callback(null,data);
          }
        })
    }
  }
}
