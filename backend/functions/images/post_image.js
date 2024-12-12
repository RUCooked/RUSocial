// Helper function to determine the MIME type of a file based on its extension
function getMimeType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
  
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      default:
        return 'application/octet-stream'; // Default binary type
    }
  }
  
  // Function to handle image upload
  async function postImage(s3, bucketName, region, base64Images) {
    const uploadedUrls = [];
  
    for (const { base64, fileName } of base64Images) {
      // Validate the input
      if (!base64 || !fileName) {
        throw new Error("Each image must have a 'base64' string and a 'fileName'");
      }
  
      // Decode the Base64 string
      const buffer = Buffer.from(base64, 'base64');
  
      // Define the S3 upload parameters
      const uploadParams = {
        Bucket: bucketName,
        Key: `uploads/${fileName}`, // Define the path and file name in the bucket
        Body: buffer,
        ContentType: getMimeType(fileName), // Determine MIME type from file name
      };
  
      // Upload the image to S3
      await s3.upload(uploadParams).promise();
  
      // Construct the URL to the uploaded image
      const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/uploads/${fileName}`;
      uploadedUrls.push(imageUrl);
    }
  
    return uploadedUrls;
  }
  
  module.exports = {
    postImage,
  };
  