exports.getImage = async (s3, bucketName, region) => {
    try {
      // Fetch all objects in the bucket
      const params = {
        Bucket: bucketName,
      };
  
      const data = await s3.listObjectsV2(params).promise();
  
      // Map objects to their URLs
      const imageUrls = data.Contents.map((item) => {
        return `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`;
      });
  
      return imageUrls;
    } catch (error) {
      console.error('Error listing images from S3:', error);
      throw new Error('Failed to list images');
    }
  };
  