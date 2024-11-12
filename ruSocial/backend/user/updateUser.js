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
    const [authRows] = await connection.execute(authQuery, [username, password]);

    if (authRows.length === 0) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    // Parse input data from the event body
    const { bio, followers, following } = JSON.parse(event.body);

    // Build the update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (followers !== undefined) {
      updates.push('followers = ?');
      values.push(followers);
    }
    if (following !== undefined) {
      updates.push('following = ?');
      values.push(following);
    }

    if (updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No valid fields to update' }),
      };
    }

    // Add username to the values array for WHERE clause
    values.push(username);

    // Update the user information
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE username = ?`;
    const [result] = await connection.execute(updateQuery, values);

    // Check if the user was updated
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found or no changes made' }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User updated successfully' }),
    };
  } catch (error) {
    // Handle errors
    console.error('Error updating user in the database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update user', error: error.message }),
    };
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
    }
  }
};
