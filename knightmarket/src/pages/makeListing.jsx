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

  // const uploadImage = async (base64Image, fileName) => {
  //   try {
  //     const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/images', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         base64Image,
  //         fileName,
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Failed to upload image.');
  //     }
  
  //     const result = await response.json();
  //     console.log('Raw API Response:', result);

  //     const imageUrls = JSON.parse(result.body).imageUrls;
  //     return imageUrls[0]; // Assuming single image upload
  //   } catch (err) {
  //     console.error(err);
  //     throw new Error('Image upload failed.');
  //   }
  // };

  const postListing = async (listingData) => {
    try {
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/dev/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'username:password' // Replace with real credentials
        },
        body: JSON.stringify(listingData)
      });

      if (!response.ok) {
        throw new Error('Failed to post listing.');
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
        console.log('Base64 Image:', base64Image);

        try {
          // Upload image and get URL
          const imageUrl = await uploadImage(base64Image, `listing_${Date.now()}`);
          console.log('Image uploaded successfully:', imageUrl);
          alert(`Image URL: ${imageUrl}`);

          // // Prepare data for the listing
          // const listingData = {
          //   user_id: userId,
          //   title: formData.title,
          //   product_description: formData.description,
          //   product_price: parseFloat(formData.price.replace(/[^0-9.]/g, '')),
          //   images_url: imageUrl
          // };

          // // Post the listing
          // const newListing = await postListing(listingData);
          // console.log('Listing created successfully:', newListing);

          // if (addListing) {
          //   addListing(newListing);
          // }

          // // Navigate back to the marketplace
          // navigate('/marketplace');
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