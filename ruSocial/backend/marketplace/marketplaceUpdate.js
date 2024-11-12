const mysql = require('mysql2/promise');

const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  
  // Validate the 'credentials' header
  const credentials = event.headers.credentials;
  if (!credentials) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Missing credentials' }),
    };
  }

  // Parse the 'credentials' header into username and password
  const [username, password] = credentials.split(':');
  if (!username || !password) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Invalid credentials format. Expected {username}:{password}' }),
    };
  }


  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Validate user credentials against the database (assuming 'users' table has columns 'username' and 'password')
    const authQuery = `SELECT * FROM users WHERE username = ? AND password = ?`;
    const [authRows] = await connection.execute(authQuery, [headerUsername, headerPassword]);

    if (authRows.length === 0) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    // Extract required query string parameters
    const {title, body, product_price, image_url} = event.queryStringParameters || {};

    // Check if the required data is provided
    if (!title || !body || !product_price || !image_url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: title, body, product price, or image url.' }),
      };
    }

    // Insert the new user into the users table
    const insertQuery = `
      INSERT INTO users (title, body, product_price, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.execute(insertQuery, [
      title, 
      body,
      product_price,
      image_url
    ]);

    // Return success response
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Post changed successfully', userId: result.insertId }),
    };
  } catch (error) {
    // Handle errors
    console.error('Error inserting post into the database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update post', error: error.message }),
    };
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
    }
  }
};
