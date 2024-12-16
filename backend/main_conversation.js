// conversation main
const postConversation = require('./post_conversation');
const getConversation = require('./get_conversation');
const putConversation = require('./put_conversation');
const deleteConversation = require('./delete_conversation');

exports.handler = async (event) => {
    const method = event.httpMethod;
    let response;

    try {
        if (method === 'POST') {
            response = await postConversation(event);
        } else if (method === 'GET') {
            response = await getConversation(event);
        } else if (method === 'PUT') {
            response = await putConversation(event);
        } else if (method === 'DELETE') {
            response = await deleteConversation(event);
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
