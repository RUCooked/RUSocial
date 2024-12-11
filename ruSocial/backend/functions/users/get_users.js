// get_users.js

exports.handler = async (queryParams, pool) => {
    try {
        let baseQuery = 'SELECT * FROM users';
        const conditions = [];
        const params = [];

        // Extract allowed query parameters
        if (queryParams && Object.keys(queryParams).length > 0) {
            const {
                username,
                email,
                blocked_id,
                follower_id,
                threads_following_id
            } = queryParams;

            if (username) {
                conditions.push('username = ?');
                params.push(username);
            }
            if (email) {
                conditions.push('email = ?');
                params.push(email);
            }

            // Construct WHERE clause for user table
            if (conditions.length > 0) {
                baseQuery += ' WHERE ' + conditions.join(' AND ');
            }
        }

        // Fetch users based on user table parameters
        const [users] = await pool.execute(baseQuery, params);

        // Handle related tables
        let relatedResults = {};

        // Helper function to fetch related users
        const fetchRelatedUsers = async (table, column, value, key) => {
            if (value) {
                let query, queryParams;
                switch (key) {
                    case 'blocked_id':
                        query = 'SELECT user_id FROM blocked_ids WHERE blocked_id = ?';
                        break;
                    case 'follower_id':
                        query = 'SELECT user_id FROM followers_ids WHERE follower_id = ?';
                        break;
                    case 'threads_following_id':
                        query = 'SELECT user_id FROM threads_following WHERE thread_id = ?';
                        break;
                    default:
                        return;
                }
                queryParams = [value];

                const [relatedUsers] = await pool.execute(query, queryParams);
                if (relatedUsers.length > 0) {
                    const userIds = relatedUsers.map(row => row.user_id);
                    if (userIds.length > 0) {
                        const placeholders = userIds.map(() => '?').join(',');
                        const [userDetails] = await pool.execute(
                            `SELECT id, username FROM users WHERE id IN (${placeholders})`,
                            userIds
                        );
                        relatedResults[key] = {};
                        userDetails.forEach(user => {
                            relatedResults[key][user.id] = user.username;
                        });
                    }
                }
            }
        };

        // Fetch related data concurrently
        await Promise.all([
            fetchRelatedUsers('blocked_ids', 'blocked_id', queryParams.blocked_id, 'blocked'),
            fetchRelatedUsers('followers_ids', 'follower_id', queryParams.follower_id, 'followers'),
            fetchRelatedUsers('threads_following', 'threads_following_id', queryParams.threads_following_id, 'threads_following')
        ]);

        // Combine user data and related results
        const response = {
            users: users,
            related: relatedResults
        };

        return generateResponse(200, response);

    } catch (error) {
        console.error('Get Users Error:', error);
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
