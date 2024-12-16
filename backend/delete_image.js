exports.deleteImage = async (s3, bucketName, s3Urls) => {
  try {
    // Ensure s3Urls is an array for batch processing
    const urlsArray = Array.isArray(s3Urls) ? s3Urls : [s3Urls];

    // Pattern to extract bucket and key from the S3 URL
    const s3Pattern = /^https:\/\/([^/]+)\.s3\.([^/]+)\.amazonaws\.com\/(.+)$/;

    const deletePromises = urlsArray.map((s3Url) => {
      const match = s3Url.match(s3Pattern);

      if (!match) {
        throw new Error(`Invalid 's3Url' format: ${s3Url}`);
      }

      const extractedBucketName = match[1];
      const key = match[3];

      // Ensure the bucket name matches the environment variable
      if (extractedBucketName !== bucketName) {
        throw new Error(`The bucket in 's3Url' (${extractedBucketName}) does not match the configured bucket (${bucketName})`);
      }

      // Return the deleteObject promise
      return s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    return `Successfully deleted ${urlsArray.length} image(s)`;
  } catch (error) {
    console.error('Error deleting image(s) from S3:', error);
    throw new Error(`Failed to delete image(s): ${error.message}`);
  }
};
