import React, { useState } from 'react';
import * as Amplify from 'aws-amplify';
import { uploadImage } from '../utils/imageUpload';
import { getAuthToken } from '../utils/getJWT';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
const{ Auth } = Amplify;

function MakeListing({ addListing }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserIdByEmail = async (email) => {
    try {
      const response = await fetch(`https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'masterknight:chickenNugget452!' // Secure this later
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user information.');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('No user found with the provided email.');
      }

      return data[0].user_id; // Assuming the API returns an array of users
    } catch (err) {
      console.error('Error fetching user_id:', err);
      throw err;
    }
  };

  const postListing = async (listingData) => {
    try {
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'masterknight:chickenNugget452!' // Secure this later
        },
        body: JSON.stringify({
          user_id: listingData.user_id, // Pass user_id from database
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

      // Get the current authenticated user's email
      const user = await Auth.currentAuthenticatedUser();
      const email = user.attributes.email; // Fetch email from Cognito user

      // Fetch user_id using the email
      const userId = await fetchUserIdByEmail(email);

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
            user_id: userId, // Include user_id
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