// main.js
const postMarketplace = require('./post_marketplace');
const deleteMarketplace = require('./delete_marketplace');
const getMarketplace = require('./get_marketplace');
const putMarketplace = require('./put_marketplace');

// Replace these with your actual credentials
const db_username = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    try {
        // Extract credentials from headers
        const credentials = headers.credentials || headers.Credentials;
        if (!credentials) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Missing credentials' }),
            };
        }
        const [username, password] = credentials.split(':');

        // Verify credentials
        if (username !== db_username || password !== db_password) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Invalid credentials' }),
            };
        }

        const method = event.httpMethod;
        switch (method) {
            case 'POST':
                return await postMarketplace.handler(event);
            case 'DELETE':
                return await deleteMarketplace.handler(event);
            case 'GET':
                return await getMarketplace.handler(event);
            case 'PUT':
                return await putMarketplace.handler(event);
            default:
                return {
                    statusCode: 405,
                    body: JSON.stringify({ message: `Method ${method} not allowed` }),
                };
        }
    } catch (error) {
        console.error('Error in main handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
