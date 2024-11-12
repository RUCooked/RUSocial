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
  // credentials=username:password
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
    const user_id = users[0].id;

    // Parse and validate the request body
    const body = JSON.parse(event.body || '{}');
    const { postsId } = body;

    // Validate required fields
    if (!postsId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required field: id' }),
      };
    }
    
    // Validate that the post belongs to the user
    const checkPostQuery = `SELECT * FROM marketplace_posts WHERE postsId = ? AND user_id = ?`;
    const [marketplace_posts] = await connection.execute(checkPostQuery, [postsId, user_id]);

    if (marketplace_posts.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Post not found or you do not have permission to delete it' }),
      };
    }
  
    // Delete the post
    const deleteQuery =' DELETE FROM marketplace_posts WHERE postsId = ?';
    await connection.execute(deleteQuery, [postsId]);

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Post deleted successfully',
      }),
    };

  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to delete post', 
        error: error.message 
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};