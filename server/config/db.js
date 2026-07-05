const sqlClient = require('./sql-client');
const dbConfig = require('./database');

const db = sqlClient.createPool(dbConfig);

module.exports = db;
