const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports = async (event) => {
    const { user1, user2, new_user1, new_user2 } = JSON.parse(event.body);
    if (!user1 || !user2 || !new_user1 || !new_user2) {
        throw new Error('Current and new user names are required');
    }

    const oldFileName = `conversationsFolder/${[user1, user2].sort().join('_')}.json`;
    const newFileName = `conversationsFolder/${[new_user1, new_user2].sort().join('_')}.json`;

    // Fetch the existing file
    const data = await s3
        .getObject({
            Bucket: BUCKET_NAME,
            Key: oldFileName,
        })
        .promise();

    // Copy the data to a new file
    await s3
        .putObject({
            Bucket: BUCKET_NAME,
            Key: newFileName,
            Body: data.Body,
            ContentType: 'application/json',
        })
        .promise();

    // Delete the old file
    await s3
        .deleteObject({
            Bucket: BUCKET_NAME,
            Key: oldFileName,
        })
        .promise();

    return { message: 'Conversation updated successfully', newFileName };
};
