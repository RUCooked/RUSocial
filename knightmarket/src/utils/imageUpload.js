import { API_ENDPOINTS } from '../config/apis';

export const uploadImage = async (images) => {
  try {
    // Check if the input is an array (multiple images) or a single image object
    const isMultipleImages = Array.isArray(images);

    // Prepare the request payload
    let requestBody;
    if (isMultipleImages) {
      requestBody = {
        images: images.map((image) => ({
          base64Image: image.base64Image,
          fileName: image.fileName,
        })),
      };
    } else {
      requestBody = {
        base64Image: images.base64Image,
        fileName: images.fileName,
      };
    }

    // Send the request
    const response = await fetch(API_ENDPOINTS.IMAGE_UPLOAD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle the response
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server Response:', errorData); // Log the server response
      throw new Error(errorData?.message || 'Failed to upload image(s).');
    }

    const result = await response.json();

    // Parse the returned image URLs
    const imageUrls = JSON.parse(result.body).imageUrls;

    return imageUrls; // Return an array of image URLs
  } catch (err) {
    console.error('Image upload error:', err);
    throw new Error('Image upload failed: ' + err.message);
  }
};