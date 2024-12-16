const pool = require('./db'); // Reuse database connection pool

exports.handler = async (event) => {
    try {
        const connection = await pool.getConnection();
        try {
            const queryParams = event.queryStringParameters || {}; // Get query string parameters
            let baseQuery = `
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.bio,
                    u.followers,
                    u.following,
                    u.image_url,
                    u.created_at,
                    u.updated_at,
                    COALESCE(GROUP_CONCAT(DISTINCT b.blocked_id), '') AS blocked_ids,
                    COALESCE(GROUP_CONCAT(DISTINCT f.follower_id), '') AS follower_ids
                FROM 
                    users u
                LEFT JOIN 
                    blocked_ids b ON u.id = b.user_id
                LEFT JOIN 
                    followers_ids f ON u.id = f.user_id
            `;
            const conditions = [];
            const params = [];

            // Special case for 'followers'
            if (queryParams.followers && queryParams.followers === 'id') {
                baseQuery = `
                    SELECT 
                        u.id,
                        u.username,
                        u.email,
                        u.bio,
                        u.followers,
                        u.following,
                        u.image_url,
                        u.created_at,
                        u.updated_at
                    FROM 
                        users u
                    INNER JOIN 
                        followers_ids f ON u.id = f.follower_id
                `;
                if (queryParams.id) {
                    conditions.push('f.user_id = ?'); // Match the user being followed
                    params.push(queryParams.id);
                }
            }

            // Special case for 'following'
            else if (queryParams.following && queryParams.following === 'id') {
                baseQuery = `
                    SELECT 
                        u.id,
                        u.username,
                        u.email,
                        u.bio,
                        u.followers,
                        u.following,
                        u.image_url,
                        u.created_at,
                        u.updated_at
                    FROM 
                        users u
                    INNER JOIN 
                        followers_ids f ON u.id = f.user_id
                `;
                if (queryParams.id) {
                    conditions.push('f.follower_id = ?'); // Match the user doing the following
                    params.push(queryParams.id);
                }
            }

            // Special case for 'blocked_ids'
            else if (queryParams.blocked_ids && queryParams.blocked_ids === 'id') {
                baseQuery = `
                    SELECT 
                        b.blocked_id AS id
                    FROM 
                        blocked_ids b
                `;
                if (queryParams.id) {
                    conditions.push('b.user_id = ?'); // Match the user who blocked others
                    params.push(queryParams.id);
                }
            }

            // Special case for 'follower_ids'
            else if (queryParams.follower_ids && queryParams.follower_ids === 'id') {
                baseQuery = `
                    SELECT 
                        f.follower_id AS id
                    FROM 
                        followers_ids f
                `;
                if (queryParams.id) {
                    conditions.push('f.user_id = ?'); // Match the user being followed
                    params.push(queryParams.id);
                }
            }

            // General case for other query parameters
            else {
                if (queryParams.id) {
                    conditions.push('u.id = ?');
                    params.push(queryParams.id);
                }
                if (queryParams.username) {
                    conditions.push('u.username = ?');
                    params.push(queryParams.username);
                }
                if (queryParams.email) {
                    conditions.push('u.email = ?');
                    params.push(queryParams.email);
                }
                if (queryParams.followers && queryParams.followers !== 'id') {
                    conditions.push('u.followers >= ?'); // Find users with at least this many followers
                    params.push(queryParams.followers);
                }
                if (queryParams.following && queryParams.following !== 'id') {
                    conditions.push('u.following >= ?'); // Find users following at least this many others
                    params.push(queryParams.following);
                }
            }

            // Add conditions to the query if they exist
            if (conditions.length > 0) {
                baseQuery += ' WHERE ' + conditions.join(' AND ');
            }

            // Group by user ID for general queries
            if (!queryParams.blocked_ids && !queryParams.follower_ids) {
                baseQuery += ' GROUP BY u.id';
            }

            console.log('Executing Query:', baseQuery, 'Params:', params);

            // Execute the query
            const [users] = await connection.query(baseQuery, params);

            console.log('Query Result:', users);

            // Release the connection back to the pool
            connection.release();

            // For general user queries, convert concatenated strings back into arrays
            const formattedUsers = queryParams.blocked_ids || queryParams.follower_ids
                ? users
                : users.map(user => ({
                    ...user,
                    blocked_ids: user.blocked_ids ? user.blocked_ids.split(',') : [],
                    follower_ids: user.follower_ids ? user.follower_ids.split(',') : [],
                }));

            // Return the formatted users
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ users: formattedUsers }),
            };
        } catch (err) {
            console.error('Error fetching users:', err);
            connection.release(); // Ensure the connection is released
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to fetch users', error: err.message }),
            };
        }
    } catch (error) {
        console.error('Error in get_users handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};
