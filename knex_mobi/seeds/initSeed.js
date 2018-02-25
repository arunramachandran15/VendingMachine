

var products = [{
        name: 'Munch',
        shortcode : 'munch',
        type: 'chocolate',
        quantity: 20,
        alert_level: 10,
        price: 20,
        cost_price : 15
    },{
        name: '5Star',
        shortcode : '5star',
        type: 'chocolate',
        quantity: 20,
        alert_level: 10,
        price: 10,
        cost_price : 5
    },{
        name: 'Cadburry',
        shortcode : 'cadburry',
        type: 'chocolate',
        quantity: 30,
        alert_level: 15,
        price: 30,
        cost_price : 20
    }]


var machine_slots = [{
        key_code: 'C1',
        product_shortcode: 'munch',
        capacity: 10,
        alert_level: 2,
        quantity : 8
    },{
        key_code: 'C2',
        product_shortcode: '5star',
        capacity: 10,
        alert_level: 2,
        quantity : 10
    },{
        key_code: 'C3',
        product_shortcode: 'cadburry',
        capacity: 10,
        alert_level: 2,
        quantity :  3
    }]


exports.seed = function(knex, Promise) {
  return Promise.join(
   
        knex('currency').del(),
        knex('transaction').del(),
        knex('machine_slot').del(),
        knex('product_inventory').del(),

        knex('currency').insert({ denomination: 50, quantity : 5}),
        knex('currency').insert({denomination: 20, quantity : 10}),
        knex('currency').insert({denomination: 10, quantity : 20}),
        
        knex('product_inventory').insert(products),

        knex('machine_slot').insert(machine_slots)


    )
};