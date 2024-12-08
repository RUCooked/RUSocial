// main.js
const mysql = require('mysql2/promise');
const postUsers = require('./post_users');
const deleteUsers = require('./delete_users');
const getUsers = require('./get_users');
const putUsers = require('./put_users');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Environment variables for API authentication
const API_USERNAME = process.env.DB_USER;
const API_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    try {

        // Safely extract headers, body, pathParameters, queryParameters, and HTTP method
        const headers = event.headers || {};
        const httpMethod = event.httpMethod;
        const pathParameters = event.pathParameters || {};
        const queryStringParameters = event.queryStringParameters || {};
        const body = event.body || {};

        // Authenticate the request
        const credentials = headers.credentials;
        if (!credentials) {
            return generateResponse(401, { message: 'Missing credentials' });
        }
        const [username, password] = credentials.split(':');
        if (username !== API_USERNAME || password !== API_PASSWORD) {
            return generateResponse(403, { message: 'Invalid credentials' });
        }

        // Parse the body if it's present

        // Route the request based on HTTP method
        let response;
        switch (httpMethod) {
            case 'POST':
                response = await postUsers.handler(body, pool);
                break;
            case 'DELETE':
                response = await deleteUsers.handler(body, pool);
                break;
            case 'GET':
                response = await getUsers.handler(queryStringParameters, pool);
                break;
            case 'PUT':
                response = await putUsers.handler(body, pool);
                break;
            default:
                response = generateResponse(405, { message: 'Method Not Allowed' });
        }

        return response;

    } catch (error) {
        console.error('Error:', error);
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
