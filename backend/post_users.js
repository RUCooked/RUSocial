// post_users.js
const pool = require('./db'); // Reuse database connection pool

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body); // Parse the JSON body

        const { id, username, email, bio = '', image_url = '' } = body;

        // Validate required fields
        if (!id || !username || !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields: id, username, email' }),
            };
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const currentTimestamp = new Date();

            // Check for duplicate username
            const [existingUser] = await connection.query(
                `SELECT username FROM users WHERE username = ?`,
                [username]
            );

            if (existingUser.length > 0) {
                return {
                    statusCode: 409, // Conflict
                    body: JSON.stringify({ message: `Username '${username}' is already taken.` }),
                };
            }

            // Insert the new user
            await connection.execute(
                `INSERT INTO users (id, username, email, bio, image_url, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, username, email, bio, image_url, currentTimestamp, currentTimestamp]
            );

            await connection.commit();

            return {
                statusCode: 201, // Created
                body: JSON.stringify({ message: `User '${username}' was created successfully!` }),
            };
        } catch (err) {
            await connection.rollback(); // Rollback on error
            console.error('Error creating user:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to create user' }),
            };
        } finally {
            connection.release(); // Release connection back to the pool
        }
    } catch (error) {
        console.error('Error in post_users handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
