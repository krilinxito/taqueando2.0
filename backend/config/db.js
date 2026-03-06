const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.join(__dirname, '../.env')
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 100,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
  timezone: '+00:00',
}).promise();

module.exports = pool;
