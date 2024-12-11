const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports = async (event) => {
    const { user1, user2 } = event.queryStringParameters;
    if (!user1 || !user2) {
        throw new Error('Both user1 and user2 are required');
    }

    const fileName = `conversationsFolder/${[user1, user2].sort().join('_')}.json`;

    const data = await s3
        .getObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
        })
        .promise();

    return JSON.parse(data.Body.toString());
};
