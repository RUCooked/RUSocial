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
  const [newUsername, newPassword] = credentials.split(':');
  if (!newUsername || !newPassword) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Invalid credentials format. Expected {username}:{password}' }),
    };
  }

  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Check if the username already exists in the users table
    const checkUserQuery = `SELECT * FROM users WHERE username = ?`;
    const [existingUserRows] = await connection.execute(checkUserQuery, [newUsername]);

    if (existingUserRows.length > 0) {
      return {
        statusCode: 409, // Conflict
        body: JSON.stringify({ message: 'Username already exists' }),
      };
    }

    // Parse input data from the event body
    const { email, bio, followers, following, blocked_ids, threads_following_ids } = JSON.parse(event.body);

    // Check if the required data is provided
    if (!newUsername || !email || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: username, email, and password' }),
      };
    }

    // Insert the new user into the users table
  const insertQuery = `
    INSERT INTO users (username, email, password, bio, followers, following, blocked_ids, threads_following_ids)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await connection.execute(insertQuery, [
    newUsername,
    email,
    newPassword, // Ideally, hash this password before storing
    bio || null, // Optional bio field
    followers !== undefined ? followers : 0, // Set to 0 if undefined, consistent with default
    following !== undefined ? following : 0, // Set to 0 if undefined, consistent with default
    blocked_ids ? JSON.stringify(blocked_ids) : null, // Ensure mediumtext field is stringified or null
    threads_following_ids ? JSON.stringify(threads_following_ids) : null // Ensure mediumtext field is stringified or null
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
