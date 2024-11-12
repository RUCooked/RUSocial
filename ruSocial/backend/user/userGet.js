const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.handler = async (event) => {
  try {
      console.log('Event:', JSON.stringify(event));
      
      // Get query parameters
      const filters = event.queryStringParameters || {};
      const { email, username, id } = filters;
      
      // Build query conditions
      const conditions = [];
      const params = [];
      
      if (email) {
          conditions.push('email = ?');
          params.push(email);
      }
      if (username) {
          conditions.push('username = ?');
          params.push(username);
      }
      if (status) {
          conditions.push('id = ?');
          params.push(id);
      }
      
      // Construct query
      let query = 'SELECT * FROM users';
      if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      // Execute query
      const [rows] = await pool.execute(query, params);
      
      return {
          statusCode: 200,
          headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
              success: true,
              data: rows
          })
      };
      
  } catch (error) {
      console.error('Error:', error);
      return {
          statusCode: 500,
          headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
              success: false,
              message: 'Internal server error'
          })
      };
  }
};