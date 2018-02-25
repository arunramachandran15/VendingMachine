var config = require('../config');
var knex = require('knex')({
	client: config.connection.client,
	connection: {
	    host     : config.connection.host,
		port     : config.connection.port,
		user     : config.connection.user,
		password : config.connection.password,
		database : config.connection.database,
		charset  : config.connection.charset,
		timezone : "UTC",
		ssl:config.connection.ssl
	},
	pool: {
		min: 0
	}
});

var test_connection = {
	    host     : config.connection.host,
		port     : config.connection.port,
		user     : config.connection.user,
		password : config.connection.password,
		database : config.connection.database,
		charset  : config.connection.charset,
		timezone : "UTC",
		ssl:config.connection.ssl
	}
console.log(test_connection);
console.log('DB Connection Established');

module.exports.knex = knex;