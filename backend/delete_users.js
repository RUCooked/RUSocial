// delete_marketplace.js
const pool = require('./db'); // Reuse database connection pool

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body); // Parse the JSON body

        const { id, username, email } = body;

        // Validate the input against userDeleteModel
        if (!id && !username && !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'At least one of the following fields is required: id, username, email',
                }),
            };
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Build the DELETE query dynamically based on the provided fields
            let deleteQuery = 'DELETE FROM marketplace_posts WHERE ';
            const conditions = [];
            const params = [];

            if (id) {
                conditions.push('id = ?');
                params.push(id);
            }
            if (username) {
                conditions.push('username = ?');
                params.push(username);
            }
            if (email) {
                conditions.push('email = ?');
                params.push(email);
            }

            // Join the conditions with OR as specified in the schema
            deleteQuery += conditions.join(' OR ');

            const [result] = await connection.execute(deleteQuery, params);

            if (result.affectedRows === 0) {
                await connection.rollback(); // No rows deleted, rollback transaction
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'No matching user found to delete' }),
                };
            }

            await connection.commit();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'User deleted successfully',
                }),
            };
        } catch (err) {
            await connection.rollback();
            console.error('Error deleting user:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to delete user' }),
            };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in delete_marketplace handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
