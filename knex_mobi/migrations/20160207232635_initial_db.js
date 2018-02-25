exports.up = function(knex, Promise) {
	return Promise.all([

		knex.schema.createTable('currency', function(table){
			table.increments('id').unsigned().primary()
			table.integer('denomination').unsigned()
			table.integer('quantity')
			table.unique(['denomination']);
			table.timestamps()
		}),

		knex.schema.createTable('product_inventory', function(table){
			table.increments('id').unsigned().primary()
			table.string('name')
			table.string('shortcode')
			table.string('type') 																	//chocolate//coke//lays
			table.integer('quantity')
			table.integer('alert_level')
			table.integer('price')
			table.integer('cost_price')
			table.unique(['shortcode']);
			table.timestamps()
		}),

		knex.schema.createTable('transaction', function(table)	{
			table.increments('id').unsigned().primary()
			table.string('product_shortcode').unsigned().references('shortcode').inTable('product_inventory')
			table.integer('paid_amount')
			table.timestamps()
		}),

		knex.schema.createTable('machine_slot', function(table) {
			table.increments('id').unsigned().primary()
			table.string('key_code')
			table.string('product_shortcode').unsigned().references('shortcode').inTable('product_inventory')
			table.integer('capacity')
			table.integer('alert_level')
			table.integer('quantity')
			table.unique(['product_shortcode', 'key_code']);
			table.timestamps()
		})

	])
}

exports.down = function(knex, Promise) {
	return Promise.all([
		
		knex.schema.dropTable('currency'),
		knex.schema.dropTable('product_inventory'),
		knex.schema.dropTable('transaction'),
		knex.schema.dropTable('machine_slot')

	])
}
