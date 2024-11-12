const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // Parse input data from the event
  const { user_id } = JSON.parse(event.body); // Assuming 'user_id' is used to identify the user to delete

  // Check if the required data is provided
  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required field: user_id' }),
    };
  }

  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Delete the user from the users table based on user_id
    const query = `
      DELETE FROM users
      WHERE id = ?
    `;
    const [result] = await connection.execute(query, [user_id]);

    // Check if any row was deleted
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    };
  } catch (error) {
    // Handle errors
    console.error('Error deleting user from the database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete user', error: error.message }),
    };
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
    }
  }
};
