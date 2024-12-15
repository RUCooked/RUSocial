import React, { useState } from 'react';
import { uploadImage } from '../utils/imageUpload';
import { getAuthHeaders } from '../utils/getJWT';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { fetchUserAttributes, getCurrentUser } from '@aws-amplify/auth';

function CreatePost({ addPost, userId }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostData = async (listingData) => {
    const verifiedHeader = await getAuthHeaders();
    try {
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/forum', {
        method: 'POST',
        headers: verifiedHeader,
        body: JSON.stringify({
          user_id: listingData.author_id, // Pass user_id from database
          title: listingData.title,
          body: listingData.body,
          images_url: listingData.images_url || ''
        })
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user information.');
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
          const imageUrl = await uploadImage(base64Image, `post_${Date.now()}`);
          console.log('Image uploaded successfully:', imageUrl);

          // Prepare data for the post
          const listingData = {
            user_id: userAttributes.sub, 
            title: formData.title,
            body: formData.body,
            images_url: imageUrl
          };

          // // Post the data
          const newPost = await createPostData(listingData);  // Changed from postData to createPostData
          console.log('Post created successfully:', newPost);

          // navigate('/forum');
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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Create a New Post</h2>
      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="postTitle" className="mb-3">
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
                placeholder="Enter post content..."
              />
            </Form.Group>

            <Form.Group controlId="postImage" className="mb-3">
              <Form.Label>Upload Image:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => navigate('/forum')} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Add Post'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreatePost;
