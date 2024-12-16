// post conversation
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


// const AWS = require('aws-sdk');
// const s3 = new AWS.S3();
// const BUCKET_NAME = process.env.BUCKET_NAME;

// module.exports = async (event) => {
//     try {
//         let requestBody;
//         try {
//             requestBody = JSON.parse(event.body);
//         } catch (e) {
//             // If event.body is already an object, use it directly
//             requestBody = event.body;
//         }
        
//         const { user1, user2 } = requestBody;
        
//         if (!user1 || !user2) {
//             return {
//                 statusCode: 400,
//                 body: JSON.stringify({ error: 'Both user1 and user2 are required' })
//             };
//         }

//         const fileName = `conversations/${[user1, user2].sort().join('_')}.json`;

//         // Check if conversation exists
//         try {
//             await s3.headObject({
//                 Bucket: BUCKET_NAME,
//                 Key: fileName,
//             }).promise();
            
//             return {
//                 statusCode: 200,
//                 body: JSON.stringify({ 
//                     message: 'Conversation already exists',
//                     fileName 
//                 })
//             };
//         } catch (error) {
//             if (error.code !== 'NotFound') {
//                 throw error;
//             }
//         }

//         // Create new conversation
//         await s3.putObject({
//             Bucket: BUCKET_NAME,
//             Key: fileName,
//             Body: JSON.stringify({
//                 users: [user1, user2],
//                 messages: []
//             }),
//             ContentType: 'application/json',
//         }).promise();

//         return {
//             statusCode: 200,
//             body: JSON.stringify({ 
//                 message: 'Conversation created successfully',
//                 fileName 
//             })
//         };
//     } catch (error) {
//         console.error('Error:', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: error.message })
//         };
//     }
// };
