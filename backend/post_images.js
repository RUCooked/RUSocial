// Helper function to determine the file extension based on magic numbers
function detectFileType(buffer) {
  // File signatures for supported file types
  const signatures = {
    jpg: { ext: 'jpg', mime: 'image/jpeg', magic: [0xFF, 0xD8, 0xFF] },
    png: { ext: 'png', mime: 'image/png', magic: [0x89, 0x50, 0x4E, 0x47] },
    gif: { ext: 'gif', mime: 'image/gif', magic: [0x47, 0x49, 0x46, 0x38] },
    bmp: { ext: 'bmp', mime: 'image/bmp', magic: [0x42, 0x4D] },
    webp: { ext: 'webp', mime: 'image/webp', magic: [0x52, 0x49, 0x46, 0x46] },
  };

  // Helper function to check if the buffer matches the file signature
  const matchesSignature = (buffer, signature) =>
    signature.every((byte, index) => buffer[index] === byte);

  // Loop through the file signatures to find a match
  for (const { ext, mime, magic } of Object.values(signatures)) {
    if (matchesSignature(buffer, magic)) {
      return { ext, mime };
    }
  }

  throw new Error('Unsupported file type');
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

    // Detect the file type and extension
    const { ext, mime } = detectFileType(buffer);

    // Append the correct file extension to the file name
    const finalFileName = `${fileName}.${ext}`;

    // Define the S3 upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: `uploads/${finalFileName}`, // Define the path and file name in the bucket
      Body: buffer,
      ContentType: mime, // Use detected MIME type
    };

    // Upload the image to S3
    await s3.upload(uploadParams).promise();

    // Construct the URL to the uploaded image
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/uploads/${finalFileName}`;
    uploadedUrls.push(imageUrl);
  }

  return uploadedUrls;
}

module.exports = {
  detectFileType,
  postImage,
};
