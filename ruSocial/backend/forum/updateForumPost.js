const mysql = require('mysql2/promise');

exports.handler = async function(event) {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  const body = JSON.parse(event.body || '{}');
  const { created_at, updated_at, username, email, password, bio } = body;

  if (!created_at || !updated_at || !username || !email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing required fields: created_at, updated_at, username, email, and password are mandatory.',
      }),
    };
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT username FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return {
        statusCode: 409, // Conflict
        body: JSON.stringify({ message: 'Username already exists' }),
      };
    }

    // Insert the new user into the users table
    const query = `
      INSERT INTO users (created_at, updated_at, username, email, password, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [
      created_at,
      updated_at,
      username,
      email,
      password,
      bio || null,
    ]);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered successfully', userId: result.insertId }),
    };
  } catch (error) {
    console.error('Error registering new user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to register user', error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
