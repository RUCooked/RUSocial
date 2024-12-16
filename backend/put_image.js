const { deleteImage } = require('./delete_image');
const { detectFileType } = require('./post_image'); // Ensure detectFileType is exported from post_image.js

exports.putImage = async (s3, bucketName, region, { s3Url, base64Image, fileName }) => {
  try {
    // Step 1: Delete the existing image
    await deleteImage(s3, bucketName, s3Url);

    // Step 2: Decode the Base64 string
    const buffer = Buffer.from(base64Image, 'base64');

    // Step 3: Detect the file type and extension
    const { ext, mime } = detectFileType(buffer);

    // Step 4: Generate a file name if not provided
    const finalFileName = fileName ? `${fileName}.${ext}` : `updated-image-${Date.now()}.${ext}`;

    // Step 5: Upload the new image
    const uploadParams = {
      Bucket: bucketName,
      Key: `uploads/${finalFileName}`,
      Body: buffer,
      ContentType: mime,
    };

    await s3.upload(uploadParams).promise();

    // Step 6: Return the new image URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/uploads/${finalFileName}`;
  } catch (error) {
    console.error('Error updating image:', error);
    throw new Error('Failed to update image: ' + error.message);
  }
};
