import React, { useState } from 'react';
import { uploadImage } from '../utils/imageUpload';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function MakeListing({ addListing, userId }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postListing = async (listingData) => {
    try {
      // console.log('Credentials:', 'masterknight:chickenNugget452');
      // console.log('user_id:', 3);
      // console.log('title:', listingData.title);
      // console.log('product_description:', listingData.product_description);
      // console.log('product_price:', listingData.product_price);
      // console.log('images_url:', listingData.images_url || '');
      
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'masterknight:chickenNugget452!' // Need to make this more secure later
        },
        body: JSON.stringify({
          user_id: 3, // Place holder, need to implement get user_id
          title: listingData.title,
          product_description: listingData.product_description,
          product_price: listingData.product_price,
          images_url: listingData.images_url || '' 
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post listing.');
      }
  
      return await response.json();
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create listing.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!image) {
        throw new Error('Please upload an image.');
      }

      // Convert image to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Strip off the prefix

        try {
          // Upload image and get URL
          const imageUrl = await uploadImage(base64Image, `listing_${Date.now()}`);
          console.log('Image uploaded successfully:', imageUrl);

          // Prepare data for the listing
          const listingData = {
            user_id: userId,
            title: formData.title,
            product_description: formData.description,
            product_price: parseFloat(formData.price.replace(/[^0-9.]/g, '')),
            images_url: imageUrl
          };

          // Post the listing
          const newListing = await postListing(listingData);
          console.log('Listing created successfully:', newListing);

          if (addListing) {
            addListing(newListing);
          }

          // Navigate back to the marketplace
          navigate('/marketplace');
        } catch (err) {
          setError(err.message);
        } finally {
          setIsSubmitting(false);
        }
      };

      reader.readAsDataURL(image);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const formattedValue = numericValue
        ? `$${Number(numericValue).toLocaleString('en-US')}`
        : '';
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
    setImage(e.target.files[0]);
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

            <Form.Group controlId="listingImage" className="mb-3">
              <Form.Label>Upload Image:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => navigate('/marketplace')} disabled={isSubmitting}>
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