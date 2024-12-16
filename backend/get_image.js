exports.getImage = async (s3, bucketName, region) => {
  try {
    let imageUrls = [];
    let continuationToken = null;

    do {
      const params = {
        Bucket: bucketName,
        ContinuationToken: continuationToken, // For pagination
      };

      const data = await s3.listObjectsV2(params).promise();

      if (data.Contents) {
        const urls = data.Contents.map((item) => {
          return `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`;
        });
        imageUrls = imageUrls.concat(urls);
      }

      continuationToken = data.NextContinuationToken; // Set token for next page
    } while (continuationToken);

    return imageUrls;
  } catch (error) {
    console.error('Error listing images from S3:', error);
    throw new Error('Failed to list images');
  }
};
