// main.js
const postUsers = require('./post_users');
const getUsers = require('./get_users'); // Placeholder for future implementation
const putUsers = require('./put_users'); // Placeholder for future implementation
const deleteUsers = require('./delete_users'); // Placeholder for future implementation

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;

        switch (method) {
            case 'POST':
                return await postUsers.handler(event);
            case 'GET':
                return await getUsers.handler(event); // To be implemented
            case 'PUT':
                return await putUsers.handler(event); // To be implemented
            case 'DELETE':
                return await deleteUsers.handler(event); // To be implemented
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
