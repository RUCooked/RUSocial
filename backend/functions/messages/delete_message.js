//testing requires you to take the timestamp 
// from get and place it in the test

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports = async (event) => {
    const { user1, user2, timestamp } = JSON.parse(event.body);

    if (!user1 || !user2 || !timestamp) {
        throw new Error('user1, user2, and timestamp are required');
    }

    const fileName = `conversationsFolder/${[user1, user2].sort().join('_')}.json`;

    const data = await s3
        .getObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
        })
        .promise();

    const conversation = JSON.parse(data.Body.toString());

    const filteredMessages = conversation.messages.filter(
        (msg) => msg.timestamp !== timestamp
    );

    if (filteredMessages.length === conversation.messages.length) {
        throw new Error('Message not found');
    }

    conversation.messages = filteredMessages;

    await s3
        .putObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: JSON.stringify(conversation),
            ContentType: 'application/json',
        })
        .promise();

    return { message: 'Message deleted successfully' };
};
