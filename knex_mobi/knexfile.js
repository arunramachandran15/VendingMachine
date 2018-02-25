// Update with your config settings.
var config = require('./config');

module.exports = {

  development: {
    client: config.connection.client,
    connection: {
      host     : config.connection.host,
      user     : config.connection.user,
      password : config.connection.password,
      database : config.connection.database,
      charset  : config.connection.charset,
      timezone : "UTC"
    },
    pool: {
      min: 1,
      max: 1
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

	staging: {
    client: config.connection.client,
    connection: {
      host     : config.connection.host,
      port     : config.connection.port,
      user     : config.connection.user,
      password : config.connection.password,
      database : config.connection.database,
      charset  : config.connection.charset,
      timezone : "UTC",
      ssl:true
    },
    pool: {
      min: 1,
      max: 1,
      ping: function (conn, cb) { conn.query('SELECT 1', cb); }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

	migration: {
    client: config.connection.client,
    connection: {
      host     : config.connection.host,
      port     : config.connection.port,
      user     : config.connection.user,
      password : config.connection.password,
      database : config.connection.database,
      charset  : config.connection.charset,
      timezone : "UTC",
      ssl:true
    },
    pool: {
      min: 1,
      max: 1,
      ping: function (conn, cb) { conn.query('SELECT 1', cb); }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: config.connection.client,
    connection: {
      host     : config.connection.host,
      user     : config.connection.user,
      password : config.connection.password,
      database : config.connection.database,
      charset  : config.connection.charset,
      timezone : "UTC"
    },
    pool: {
      min: 1,
      max: 1
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
