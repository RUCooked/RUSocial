import React, { useState } from 'react';
import { uploadImage } from '../utils/imageUpload';
import { getAuthHeaders } from '../utils/getJWT';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { fetchUserAttributes, getCurrentUser } from '@aws-amplify/auth';

function MakeListing({ addListing }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [images, setImages] = useState([]); // Updated to support multiple images
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postListing = async (listingData) => {
    const verifiedHeader = await getAuthHeaders();
    try {
      const requestBody = {
        user_id: listingData.user_id,
        title: listingData.title,
        product_description: listingData.product_description,
        product_price: listingData.product_price,
        images_url: listingData.images_url || []
      };
  
      console.log('Marketplace API Request Body:', requestBody);
  
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/marketplace', {
        method: 'POST',
        headers: verifiedHeader,
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Marketplace API Error:', errorData);
        throw new Error(errorData.message || 'Failed to post listing.');
      }
  
      return await response.json();
    } catch (err) {
      console.error('Error in postListing:', err);
      throw new Error('Failed to create listing.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
  
    try {
      if (images.length === 0) {
        throw new Error('Please upload at least one image.');
      }
  
      const userAttributes = await fetchUserAttributes();
  
      // Prepare the image data for upload
      const imageArray = images.map((image) => {
        const reader = new FileReader();
  
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64Image = reader.result.split(',')[1];
            resolve({
              base64Image,
              fileName: `listing_${Date.now()}`,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });
  
      const preparedImages = await Promise.all(imageArray);
  
      // Upload images and get URLs
      const uploadedImageUrls = await uploadImage(preparedImages);
  
      console.log('Uploaded Image URLs:', uploadedImageUrls);
  
      // Prepare listing data
      const listingData = {
        user_id: userAttributes.sub,
        title: formData.title,
        product_description: formData.description,
        product_price: parseFloat(formData.price.replace(/[^0-9.]/g, '')),
        images_url: uploadedImageUrls,
      };
  
      // Post the listing
      const newListing = await postListing(listingData);
      console.log('Listing created successfully:', newListing);
  
      if (addListing) {
        addListing(newListing);
      }
  
      navigate('/marketplace');
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
        // Allow only numbers and a single decimal point
        const numericValue = value.replace(/[^0-9.]/g, ''); // Strip everything except numbers and '.'
        const formattedValue = numericValue.match(/^\d*(\.\d{0,2})?$/) // Match up to 2 decimal places
            ? `$${numericValue}`
            : formData.price; // Keep the previous valid value if invalid input

        setFormData((prev) => ({
            ...prev,
            [name]: formattedValue
        }));
    } else {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + images.length > 10) {
      setError('You can upload a maximum of 10 images.');
      return;
    }

    setImages((prev) => [...prev, ...selectedFiles]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };


  return (
    <Container className="py-4">
      <h2 className="mb-4">Create a New Listing</h2>
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="listingTitle" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter listing title"
              />
            </Form.Group>

            <Form.Group controlId="listingPrice" className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Enter listing price"
              />
            </Form.Group>

            <Form.Group controlId="listingDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter listing description..."
              />
            </Form.Group>

            <Form.Group controlId="listingImages" className="mb-3">
              <Form.Label>Upload Images</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <div className="mt-2">
                {images.map((image, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <span className="me-2">{image.name}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="secondary"
                onClick={() => navigate('/marketplace')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Add Listing'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default MakeListing;