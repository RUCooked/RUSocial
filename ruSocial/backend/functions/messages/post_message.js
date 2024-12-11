
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports = async (event) => {
    const { user1, user2, message } = JSON.parse(event.body);

    if (!user1 || !user2 || !message) {
        throw new Error('user1, user2, and message are required');
    }

    const fileName = `conversationsFolder/${[user1, user2].sort().join('_')}.json`;

    const data = await s3
        .getObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
        })
        .promise();

    const conversation = JSON.parse(data.Body.toString());

    const newMessage = {
        sender: user1,
        content: message,
        timestamp: new Date().toISOString(),
    };

    conversation.messages.push(newMessage);

    await s3
        .putObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: JSON.stringify(conversation),
            ContentType: 'application/json',
        })
        .promise();

    return { message: 'Message added successfully' };
};
