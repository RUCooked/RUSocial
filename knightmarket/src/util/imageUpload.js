import { API_ENDPOINTS } from '../config/apis';

export const uploadImageToS3 = async (base64Image, fileName) => {
  try {
    const response = await fetch(API_ENDPOINTS.IMAGE_UPLOAD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        fileName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to upload image.');
    }

    const result = await response.json();
    const imageUrls = JSON.parse(result.body).imageUrls;
    return imageUrls[0];
  } catch (err) {
    console.error('Image upload error:', err);
    throw new Error('Image upload failed: ' + err.message);
  }
};