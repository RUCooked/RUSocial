// db.js
const mysql = require('mysql2/promise');
try {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    console.log('Database pool created successfully');
    module.exports = pool;
} catch (error) {
    console.error('Error creating database pool:', error);
    throw error;
}
