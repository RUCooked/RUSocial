
const mysql = require('mysql2/promise');

// Create a connection pool outside the handler for reusability
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

exports.handler = async (event) => {
    const triggerSource = event.triggerSource;

    if (triggerSource !== 'PostConfirmation_ConfirmSignUp') {
        console.log(`Unhandled trigger source: ${triggerSource}`);
        return event;
    }

    try {
        const userAttributes = event.request.userAttributes;

        const userId = userAttributes.sub;
        const email = userAttributes.email;

        const username = event.userName; 

        const bio = '';
        const image_url = '';
        const followers = 0;
        const following = 0;
        const currentTimestamp = new Date();

        // Check if user already exists
        const [existingUser] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            console.log('Username or email already exists');
            // Optionally, handle conflict
        } else {
            // Insert the new user
            await pool.execute(
                `INSERT INTO users 
                (id, username, email, bio, image_url, followers, following, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, username, email, bio, image_url, followers, following, currentTimestamp, currentTimestamp]
            );
            console.log(`Successfully created new user ${username} in DB`);
        }

    } catch (error) {
        console.error('Post Confirmation Error:', error);
        throw error;
    }

    return event;
};
