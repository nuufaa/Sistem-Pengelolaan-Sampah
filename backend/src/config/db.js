const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

async function testConnection() {
  try {
    db.query("SELECT 1")
  } catch (err) {
    console.error("Database connection failed:", err.message)
    throw err
  }
}

module.exports = {
    db, 
    testConnection
}