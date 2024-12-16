// get conversation
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports = async (event) => {
    const params = event.queryStringParameters;

    if (!params) {
        throw new Error('Query parameters are required');
    }

    if (params.user1 && params.user2) {
        // Original functionality: Retrieve a conversation between two users
        const user1 = params.user1;
        const user2 = params.user2;
        const fileName = `conversationsFolder/${[user1, user2].sort().join('_')}.json`;

        try {
            const data = await s3
                .getObject({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                })
                .promise();

            return JSON.parse(data.Body.toString());
        } catch (error) {
            if (error.code === 'NoSuchKey') {
                throw new Error('Conversation not found');
            }
            throw error;
        }
    } else if (params.user1 && !params.user2) {
        // New functionality: Retrieve all conversations for a single user
        const user1 = params.user1;

        try {
            const data = await s3
                .listObjectsV2({
                    Bucket: BUCKET_NAME,
                    Prefix: 'conversationsFolder/',
                })
                .promise();

            const userConversations = [];
            let x = 1;
            for (const obj of data.Contents) {
                const fileName = obj.Key;
                
                try {
                    const fileData = await s3
                        .getObject({
                            Bucket: BUCKET_NAME,
                            Key: fileName,
                        })
                        .promise();
                        
                       
                    //const conversation = JSON.parse(fileData.Body.toString());

                    if (fileName.includes(user1)) {
                        userConversations.push(fileName);
                    }
                } catch (error) {
                    console.warn(`Skipping file ${fileName} due to error: ${error.message}`);
                    continue;
                }
            }

            return userConversations;
        } catch (error) {
            throw error;
        }
    } else {
        throw new Error('Invalid query parameters: Either both user1 and user2, or only user1, must be provided');
    }
};
