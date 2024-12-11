const mysql = require('mysql2/promise');
const delete_thread = require('./delete_thread');
const get_thread = require('./get_thread');
const post_thread = require('./post_thread');
const put_thread = require('./put_thread');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
});

// TODO: REPLACE WITH COGNITO
const API_USERNAME = process.env.DB_USER;
const API_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    try {
        console.log(event.headers);
        const headers = event.headers || {};
        console.log(headers);
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

        const credentials = headers.credentials || headers.Credentials;
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
                response = await post_thread.handler(body, pool);
                break;
            case 'DELETE':
                response = await delete_thread.handler(body, pool);
                break;
            case 'GET':
                response = await get_thread.handler(queryStringParameters, pool);
                break;
            case 'PUT':
                response = await put_thread.handler(body, pool);
                break;
            default:
                response = generateResponse(405, { message: 'Method Not Allowed' });
        }

        return response;

    } catch (e) {
        console.error('Error: ', e);
        return generateResponse(500, { message: 'Internal Server Error'});
    }
}

function generateResponse (statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    };
};