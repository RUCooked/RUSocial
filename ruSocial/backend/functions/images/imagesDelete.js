exports.deleteImage = async (s3, bucketName, s3Url) => {
    try {
      // Extract the bucket name and key from the S3 URL
      const s3Pattern = /^https:\/\/([^/]+)\.s3\.([^/]+)\.amazonaws\.com\/(.+)$/;
      const match = s3Url.match(s3Pattern);
  
      if (!match) {
        throw new Error("Invalid 's3Url' format");
      }
  
      const extractedBucketName = match[1];
      const key = match[3];
  
      // Ensure the bucket name matches the environment variable
      if (extractedBucketName !== bucketName) {
        throw new Error("The bucket in 's3Url' does not match the configured bucket");
      }
  
      // Delete the object from S3
      await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
  
      return `Image successfully deleted: ${s3Url}`;
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  };
  