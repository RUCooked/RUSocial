// put_users.js

/**
 * Handler function to update user information and related entities.
 * @param {Object} data - The input data containing user information and related IDs.
 * @param {Object} pool - The MySQL connection pool.
 * @returns {Object} - HTTP response object.
 */
exports.handler = async (data, pool) => {
    const {
        id,
        username,
        email,
        password,
        bio,
        image_url,
        blocked_id,
        unblocked_id,
        follower_id,
        unfollow_id,
        thread_id,
        thread_remove_id
    } = data;

    // Validate that the user ID is provided
    if (!id) {
        return generateResponse(400, { message: 'User ID is required for update.' });
    }

    let connection;

    try {
        // Acquire a connection from the pool
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update the users table if any user-related fields are provided
        await updateUserTable(connection, { id, username, email, password, bio, image_url });

        // Handle blocked_ids operations
        await handleBlockedIds(connection, { id, blocked_id, unblocked_id });

        // Handle followers_ids operations
        await handleFollowersIds(connection, { id, follower_id, unfollow_id });

        // Handle threads_following operations
        await handleThreadsFollowing(connection, { id, thread_id, thread_remove_id });

        // Commit the transaction after all operations succeed
        await connection.commit();

        return generateResponse(200, { message: `User with ID ${id} was updated successfully!` });

    } catch (error) {
        // Rollback the transaction in case of any errors
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Rollback Error:', rollbackError);
            }
        }
        console.error('Put Users Error:', error);
        return generateResponse(500, { message: 'Internal Server Error' });
    } finally {
        // Ensure the connection is always released back to the pool
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Updates the users table with provided fields.
 * @param {Object} connection - The MySQL connection.
 * @param {Object} fields - The user fields to update.
 */
async function updateUserTable(connection, fields) {
    const { id, username, email, password, bio, image_url } = fields;
    const userFields = [];
    const userParams = [];

    if (username !== undefined) {
        userFields.push('username = ?');
        userParams.push(username);
    }
    if (email !== undefined) {
        userFields.push('email = ?');
        userParams.push(email);
    }
    if (password !== undefined) {
        userFields.push('password = ?');
        userParams.push(password); // Consider hashing the password before storing
    }
    if (bio !== undefined) {
        userFields.push('bio = ?');
        userParams.push(bio);
    }
    if (image_url !== undefined) {
        userFields.push('image_url = ?');
        userParams.push(image_url);
    }

    if (userFields.length > 0) {
        userFields.push('updated_at = ?');
        userParams.push(new Date());

        const updateUserQuery = `UPDATE users SET ${userFields.join(', ')} WHERE id = ?`;
        userParams.push(id);

        await connection.execute(updateUserQuery, userParams);
    }
}

/**
 * Handles operations related to the blocked_ids table.
 * @param {Object} connection - The MySQL connection.
 * @param {Object} params - The parameters for blocked_ids operations.
 */
async function handleBlockedIds(connection, params) {
    const { id, blocked_id, unblocked_id } = params;

    // Add or remove a blocked user
    if (blocked_id !== undefined) {
        if (blocked_id === null) {
            // Remove all blocked_ids for the user
            await connection.execute('DELETE FROM blocked_ids WHERE user_id = ?', [id]);
        } else {
            // Add a new blocked_id
            await connection.execute(
                'INSERT INTO blocked_ids (user_id, blocked_id, blocked_date) VALUES (?, ?, ?)',
                [id, blocked_id, new Date()]
            );
        }
    }

    // Unblock a specific user
    if (unblocked_id !== undefined && unblocked_id !== null) {
        await connection.execute(
            'DELETE FROM blocked_ids WHERE user_id = ? AND blocked_id = ?',
            [id, unblocked_id]
        );
    }
}

/**
 * Handles operations related to the followers_ids table.
 * @param {Object} connection - The MySQL connection.
 * @param {Object} params - The parameters for followers_ids operations.
 */
async function handleFollowersIds(connection, params) {
    const { id, follower_id, unfollow_id } = params;

    // Add or remove followers
    if (follower_id !== undefined) {
        if (follower_id === null) {
            // Remove all followers for the user
            await connection.execute('DELETE FROM followers_ids WHERE user_id = ?', [id]);
        } else {
            // Add a new follower_id
            await connection.execute(
                'INSERT INTO followers_ids (user_id, follower_id) VALUES (?, ?)',
                [id, follower_id]
            );
        }
    }

    // Unfollow a specific user
    if (unfollow_id !== undefined && unfollow_id !== null) {
        await connection.execute(
            'DELETE FROM followers_ids WHERE user_id = ? AND follower_id = ?',
            [id, unfollow_id]
        );
    }
}

/**
 * Handles operations related to the threads_following table.
 * @param {Object} connection - The MySQL connection.
 * @param {Object} params - The parameters for threads_following operations.
 */
async function handleThreadsFollowing(connection, params) {
    const { id, thread_id, thread_remove_id } = params;

    // Add or remove thread subscriptions
    if (thread_id !== undefined) {
        if (thread_id === null) {
            // Remove all thread_following entries for the user
            await connection.execute('DELETE FROM threads_following WHERE user_id = ?', [id]);
        } else {
            // Add a new thread_id
            await connection.execute(
                'INSERT INTO threads_following (user_id, thread_id) VALUES (?, ?)',
                [id, thread_id]
            );
        }
    }

    // Remove a specific thread subscription
    if (thread_remove_id !== undefined && thread_remove_id !== null) {
        await connection.execute(
            'DELETE FROM threads_following WHERE user_id = ? AND thread_id = ?',
            [id, thread_remove_id]
        );
    }
}

/**
 * Helper function to generate HTTP responses.
 * @param {number} statusCode - The HTTP status code.
 * @param {Object} body - The response body.
 * @returns {Object} - The HTTP response object.
 */
function generateResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
