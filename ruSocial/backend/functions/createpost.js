const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  try {
    // Parse request data (assuming JSON format)
    const { description, imageBase64, imageMimeType, imageName } = JSON.parse(event.body);

    // Generate a unique image key for S3
    const imageKey = `images/posts/${uuidv4()}-${imageName}`;

    // Upload image to S3
    const uploadParams = {
      Bucket: 'swefall452',
      Key: imageKey,
      Body: Buffer.from(imageBase64, 'base64'), // Adjust this based on your data
      ContentType: imageMimeType,
    };
    const s3Response = await s3.upload(uploadParams).promise();

    // Connect to RDS and store post metadata
    const connection = await mysql.createConnection(dbConfig);
    const insertQuery = `
      INSERT INTO posts (description, image_url, created_at)
      VALUES (?, ?, NOW())
    `;
    await connection.execute(insertQuery, [description, s3Response.Location]);
    await connection.end();

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Post created successfully', imageUrl: s3Response.Location }),
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create post' }),
    };
  }
};
