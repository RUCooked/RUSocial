const AWS = require('aws-sdk');
const { postImage } = require('./post_image');
const { deleteImage } = require('./delete_image');
const { getImage } = require('./get_image');
const { putImage } = require('./put_image');

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
    const body = event.body;
    const httpMethod = event.httpMethod;

    // Handle different actions
    switch (httpMethod) {
      case 'POST':
        return await postImageHandler(body); // Handle posting images
      case 'DELETE':
        return await deleteImageHandler(body); // Handle deleting images
      case 'GET':
        return await getImageHandler(body); // Handle retrieving image URLs
      case 'PUT':
        return await putImageHandler(body);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Invalid action specified: ${httpMethod}` }),
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
  // Parse the request body
  let base64Images;

  if (body.base64Image && body.fileName) {
    // Single image upload
    base64Images = [{ base64: body.base64Image, fileName: body.fileName }];
  } else if (body.images && Array.isArray(body.images)) {
    // Batch image upload
    base64Images = body.images.map(({ base64Image, fileName }) => ({
      base64: base64Image,
      fileName
    }));
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request format. Provide 'base64Image' and 'fileName' for single upload, or 'images' for batch upload." }),
    };
  }

  // Validate the base64Images array
  if (!base64Images || base64Images.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "'images' must be a non-empty array" }),
    };
  }

  // Call the postImage function
  try {
    const uploadedUrls = await postImage(s3, BUCKET_NAME, REGION, base64Images);
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrls: uploadedUrls }),
    };
  } catch (error) {
    console.error('Error uploading images:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Handler for deleting images
async function deleteImageHandler(body) {
  let urlsToDelete;

  if (body.s3Url) {
    // Single image deletion
    urlsToDelete = [body.s3Url];
  } else if (body.imageUrls && Array.isArray(body.imageUrls)) {
    // Batch image deletion
    urlsToDelete = body.imageUrls;
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request format. Provide 's3Url' for single deletion or 'imageUrls' for batch deletion." }),
    };
  }

  try {
    // Delete each image
    const results = [];
    for (const url of urlsToDelete) {
      const deleteResult = await deleteImage(s3, BUCKET_NAME, url);
      results.push({ url, status: deleteResult });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Images deleted successfully", results }),
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

    if (imageUrls.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ imageUrls, message: "No images found in the bucket." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrls }),
    };
  } catch (error) {
    console.error('Error retrieving images:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function putImageHandler(body) {
  try {
    if (!body.s3Url || !body.base64Image) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "'s3Url' and 'base64Image' must be provided in the request body",
        }),
      };
    }

    const newImageUrl = await putImage(s3, BUCKET_NAME, REGION, body);
    return {
      statusCode: 200,
      body: JSON.stringify({ newImageUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
