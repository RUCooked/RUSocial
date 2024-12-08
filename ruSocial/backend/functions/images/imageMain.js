const AWS = require('aws-sdk');
const { postImage } = require('./post_image');
const { deleteImage } = require('./delete_image');
const { getImage } = require('./get_image');

// Initialize the S3 client
const s3 = new AWS.S3();

// Fetch the environment variables
const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.AWS_REGION;

// Validate environment variables
if (!BUCKET_NAME || !REGION) {
  throw new Error("Environment variables 'BUCKET_NAME' or 'AWS_REGION' are not defined");
}

// Export the S3 client for use in other modules
exports.s3 = s3;

exports.handler = async (event) => {
  try {
    // Parse the request body
    const body = JSON.parse(event.body);

    // Validate the action
    const action = body.action; // Expect 'action' to specify the operation

    if (!action) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Action not specified in request body' }),
      };
    }

    // Handle different actions
    switch (action) {
      case 'post':
        return await postImageHandler(body); // Handle posting images
      case 'delete':
        return await deleteImageHandler(body); // Handle deleting images
      case 'get':
        return await getImageHandler(); // Handle retrieving image URLs
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Invalid action specified: ${action}` }),
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to process request', error: error.message }),
    };
  }
};

// Handler for posting images
async function postImageHandler(body) {
  // Process a single image or multiple images
  const base64Images = body.base64Image
    ? [{ base64: body.base64Image, fileName: body.fileName }]
    : body.base64Images;

  // Validate the base64Images array
  if (!Array.isArray(base64Images) || base64Images.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "'base64Images' must be a non-empty array" }),
    };
  }

  // Call the postImage function
  const uploadedUrls = await postImage(s3, BUCKET_NAME, REGION, base64Images);
  return {
    statusCode: 200,
    body: JSON.stringify({ imageUrls: uploadedUrls }),
  };
}

// Handler for deleting images
async function deleteImageHandler(body) {
  // Validate input
  if (!body.s3Url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "'s3Url' must be provided in the request body" }),
    };
  }

  // Call the deleteImage function
  try {
    const deleteResult = await deleteImage(s3, BUCKET_NAME, body.s3Url);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: deleteResult }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Handler for retrieving image URLs
async function getImageHandler() {
  try {
    const imageUrls = await getImage(s3, BUCKET_NAME, REGION);
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrls }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
