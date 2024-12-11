// delete_users.js

exports.handler = async (data, pool) => {
    try {
        const { id, username, email } = data;

        // Validate that at least one identifier is provided
        if (!id && !username && !email) {
            return generateResponse(400, { message: 'At least one identifier (id, username, or email) is required to delete a user.' });
        }

        // Determine which identifier to use (priority: id > username > email)
        let query;
        let params;
        let identifierUsed;

        if (id) {
            query = 'SELECT * FROM users WHERE id = ?';
            params = [id];
            identifierUsed = `id: ${id}`;
        } else if (username) {
            query = 'SELECT * FROM users WHERE username = ?';
            params = [username];
            identifierUsed = `username: ${username}`;
        } else if (email) {
            query = 'SELECT * FROM users WHERE email = ?';
            params = [email];
            identifierUsed = `email: ${email}`;
        }

        // Fetch the user to ensure they exist
        const [users] = await pool.execute(query, params);
        if (users.length === 0) {
            return generateResponse(404, { message: `User with ${identifierUsed} does not exist.` });
        }

        // Assume unique identifiers, so only one user should be returned
        const user = users[0];
        const userId = user.id;
        const usernameToDelete = user.username;

        // Begin transaction to ensure atomicity
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Delete from blocked_ids where user is blocker or blocked
            await connection.execute('DELETE FROM blocked_ids WHERE user_id = ? OR blocked_id = ?', [userId, userId]);
            
            await connection.execute('DELETE FROM marketplace_posts WHERE user_id = ?', [userId]);

            // 2. Delete from followers_ids where user is follower or being followed
            await connection.execute('DELETE FROM followers_ids WHERE user_id = ? OR follower_id = ?', [userId, userId]);
            
            // 3. Delete from moderators where user is the moderator
            await connection.execute('DELETE FROM moderators WHERE user_id = ?', [userId]);
            
            // 4. Delete from post_votes where user has voted
            await connection.execute('DELETE FROM post_votes WHERE user_id = ?', [userId]);

            // 5. Delete from threads_following where user is following threads
            await connection.execute('DELETE FROM threads_following WHERE user_id = ?', [userId]);
            
            // 6. Finally, delete the user from users table
            await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

            // Commit the transaction
            await connection.commit();
            connection.release();

            return generateResponse(200, { message: `User '${usernameToDelete}' was deleted successfully!` });

        } catch (transactionError) {
            // Rollback in case of any error during the transaction
            await connection.rollback();
            connection.release();
            console.error('Transaction Error:', transactionError);
            return generateResponse(500, { message: 'Failed to delete user due to an internal error.' });
        }

    } catch (error) {
        console.error('Delete Users Error:', error);
        return generateResponse(500, { message: 'Internal Server Error' });
    }
};

// Helper function to generate HTTP responses
function generateResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
