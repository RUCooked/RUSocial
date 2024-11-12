import mysql from 'mysql2/promise';

export async function handler(event) {
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // Optional query parameters for filtering or pagination
  const { item_name, category, limit, offset } = event.queryStringParameters || {};

  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Build the base query
    let query = 'SELECT * FROM marketplace';
    const conditions = [];
    const values = [];

    // Add filtering conditions if provided
    if (item_name) {
      conditions.push('item_name LIKE ?');
      values.push(`%${item_name}%`);
    }
    if (category) {
      conditions.push('category = ?');
      values.push(category);
    }

    // Append conditions to the query
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add pagination
    if (limit) {
      query += ' LIMIT ?';
      values.push(parseInt(limit, 10));
    }
    if (offset) {
      query += ' OFFSET ?';
      values.push(parseInt(offset, 10));
    }

    // Execute the query
    const [rows] = await connection.execute(query, values);

    // Return the list of marketplace items
    return {
      statusCode: 200,
      body: JSON.stringify({ items: rows }),
    };
  } catch (error) {
    // Handle errors
    console.error('Error fetching marketplace items:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch marketplace items', error: error.message }),
    };
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
    }
  }
}
