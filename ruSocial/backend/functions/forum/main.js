const mysql = require('mysql2/promise');
const post_forum = require('./post_forum');
const get_forum = require('./get_forum');
const put_forum = require('./put_forum');
const delete_forum = require('./delete_forum');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
});

const API_USERNAME = process.env.DB_USER;
const API_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    try {
        const headers = event.headers || {};
        const httpMethod = event.httpMethod;
        const pathParameters = event.pathParameters || {};
        const queryStringParameters = event.queryStringParameters || {};


        let body
        try {
            if (typeof(event.body) === 'string') {
                body = JSON.parse(event.body);
            } else {
                body = event.body;
            }
        } catch (e) {
            console.error('Error parsing body:', e);
            return generateResponse(400, { message: 'Invalid JSON in request body' });
        }

        // The following is a super basic way of handling credentials. 
        // we're going to replace this with handling JWT tokens
        // for now this is fine
        const credentials = headers.credentials;
        if (!credentials) {
            return generateResponse(401, { message: 'Missing credentials' });
        }
        const [username, password] = credentials.split(':');
        if (username !== API_USERNAME || password !== API_PASSWORD) {
            return generateResponse(403, { message: 'Invalid credentials' });
        }

        let response;
        switch (httpMethod) {
            case 'POST':
                response = await post_forum.handler(body, pool);
                break;
            case 'DELETE':
                response = await delete_forum.handler(body, pool);
                break;
            case 'GET':
                response = await get_forum.handler(queryStringParameters, pool);
                break;
            case 'PUT':
                response = await put_forum.handler(body, pool);
                break;
            default:
                response = generateResponse(405, { message: 'Method Not Allowed' });
        }

        return response;
    }
    catch (e) {
        console.error('Error:', e);
        return generateResponse(500, { message: 'Internal Server Error' });
    };
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