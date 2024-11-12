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

    // Validate user credentials and get user ID
    const authQuery = `SELECT id FROM users WHERE username = ? AND password = ?`;
    const [users] = await connection.execute(authQuery, [username, password]);

    if (users.length === 0) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    const author_id = users[0].id;

    // Parse subreddit_id from query parameters
    const subreddit_id = event.queryStringParameters && event.queryStringParameters.subreddit_id;
    if (!subreddit_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required query parameter: subreddit_id' }),
      };
    }

    // Parse and validate the request body
    const body = JSON.parse(event.body || '{}');
    const { type, title, body: postBody } = body;

    // Validate required fields
    if (!type || !title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: type and title are required' }),
      };
    }

    // Validate type enum
    if (!['text', 'link'].includes(type)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid post type. Must be either "text" or "link"' }),
      };
    }

    // Create the post
    const insertQuery = `
      INSERT INTO forum_posts (type, title, body, author_id, subreddit_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(insertQuery, [
      type,
      title,
      postBody || null,
      author_id,
      subreddit_id
    ]);

    // Return success response
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Post created successfully',
        postId: result.insertId
      }),
    };

  } catch (error) {
    console.error('Error creating post:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to create post', 
        error: error.message 
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};