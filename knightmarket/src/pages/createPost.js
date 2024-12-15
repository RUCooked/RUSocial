import React, { useState } from 'react';
import { uploadImage } from '../utils/imageUpload';
import { getAuthHeaders } from '../utils/getJWT';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { fetchUserAttributes, getCurrentUser } from '@aws-amplify/auth';


function CreatePost({ addPost }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = async (postingData) =>{
    const verifiedHeader = await getAuthHeaders();
    try{
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/forum',{
        method: 'POST',
        headers: verifiedHeader,
        body: JSON.stringify({
          author_id: postingData.author_id,
          title: postingData.title,
          body: postingData.body,
          image_url: postingData.image_url || ''
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

      const userAttributes = await fetchUserAttributes();

      // Convert image to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Strip off the prefix

        try {
          // Upload image and get URL
          const imageUrl = await uploadImage(base64Image, `listing_${Date.now()}`);
          console.log('Image uploaded successfully:', imageUrl);

          // Prepare data for the listing
          const postingData = {
            user_id: userAttributes.sub, 
            title: formData.title,
            product_description: formData.description,
            product_price: parseFloat(formData.price.replace(/[^0-9.]/g, '')),
            images_url: imageUrl
          };

          // Post the listing
          const newListing = await postListing(postingData);
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Create New Post</h2>
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter post title"
              />
            </Form.Group>

            <Form.Group controlId="postContent" className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="Write your post content here..."
              />
            </Form.Group>

            <Form.Group controlId="postImage" className="mb-3">
              <Form.Label>Upload Image:</Form.Label>
                <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                multiple
                />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => navigate('/forum')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Post
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreatePost;