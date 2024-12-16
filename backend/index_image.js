const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log("Testing S3 connectivity...");

    const textContent = "This is a connectivity test.";
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: "test-file.txt",
        Body: textContent,
    };

    try {
        await s3.putObject(params).promise();
        console.log("S3 connectivity test succeeded.");
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "S3 connectivity test succeeded." }),
        };
    } catch (error) {
        console.error("S3 connectivity test failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `S3 connectivity test failed: ${error.message}` }),
        };
    }
};
