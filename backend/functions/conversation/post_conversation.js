const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports = async (event) => {
    const { user1, user2 } = JSON.parse(event.body);
    if (!user1 || !user2) {
        throw new Error('Both user1 and user2 are required');
    }

    // Generate file name based on user names in alphabetical order
    const fileName = `conversationsFolder/${[user1, user2].sort().join('_')}.json`;

    // Check if the file already exists
    try {
        await s3
            .headObject({
                Bucket: BUCKET_NAME,
                Key: fileName,
            })
            .promise();
        throw new Error('Conversation already exists');
    } catch (err) {
        if (err.code !== 'NotFound') {
            throw err; // Re-throw other errors
        }
    }

    // Create a new conversation file
    const initialData = { users: [user1, user2], messages: [] };
    await s3
        .putObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: JSON.stringify(initialData),
            ContentType: 'application/json',
        })
        .promise();

    return { message: 'Conversation created successfully', fileName };
};
