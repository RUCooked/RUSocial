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
  const { username, email, password, bio, followers_ids, following_ids, blocked_ids, threads_following_ids } = JSON.parse(event.body);

  // Check if the required data is provided
  if (!username || !email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: username, email, and password' }),
    };
  }

  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Insert the new user into the users table
    const query = `
      INSERT INTO users (username, email, password, bio, followers, followers_ids, following, following_ids, blocked_ids, threads_following_ids)
      VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [
      username,
      email,
      password,
      bio || null, // Optional bio field
      followers_ids || null, // Optional followers_ids field
      following_ids || null, // Optional following_ids field
      blocked_ids || null, // Optional blocked_ids field
      threads_following_ids || null, // Optional threads_following_ids field
    ]);

    // Return success response
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User created successfully', userId: result.insertId }),
    };
  } catch (error) {
    // Handle errors
    console.error('Error inserting user into the database:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create user', error: error.message }),
    };
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
    }
  }
};
