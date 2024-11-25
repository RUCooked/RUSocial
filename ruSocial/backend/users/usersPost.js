// post_users.js

exports.handler = async (data, pool) => {
    try {
        const { username, email, password, bio = '', image_url = '' } = data;
        // Validate required fields
        if (!username || !email || !password) {
            return generateResponse(400, { message: 'username, email, and password are required' });
        }

        // Check if username or email already exists
        const [existingUser] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return generateResponse(409, { message: 'Username or email already exists' });
        }

        // Insert the new user
        const currentTimestamp = new Date();
        await pool.execute(
            `INSERT INTO users 
            (username, email, password, bio, image_url, followers, following, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)`,
            [username, email, password, bio, image_url, currentTimestamp, currentTimestamp]
        );

        return generateResponse(201, { message: `User ${username} was created successfully!` });

    } catch (error) {
        console.error('Post Users Error:', error);
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
