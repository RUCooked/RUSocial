const postMessage = require('./post_message');
const getMessages = require('./get_message');
const putMessage = require('./put_message');
const deleteMessage = require('./delete_message');

exports.handler = async (event) => {
    const method = event.httpMethod;
    let response;

    try {
        if (method === 'POST') {
            response = await postMessage(event);
        } else if (method === 'GET') {
            response = await getMessages(event);
        } else if (method === 'PUT') {
            response = await putMessage(event);
        } else if (method === 'DELETE') {
            response = await deleteMessage(event);
        } else {
            throw new Error('Unsupported HTTP method');
        }

        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
