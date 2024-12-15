import React, { useState } from 'react';
import * as Amplify from 'aws-amplify';
import { uploadImage } from '../utils/imageUpload';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function CreatePost({ addPost, userId }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: ''
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
  const createPostData = async (postData) => {
    try {
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/dev/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'masterknight:chickenNugget452!' // Replace with real credentials
        },
        body: JSON.stringify({
          title: postData.title,
          body: postData.body,
          user_id: postData.author_id, // Pass user_id from database
          images_url: postData.images_url || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post data.');
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create post.');
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
          const imageUrl = await uploadImage(base64Image, `post_${Date.now()}`);
          console.log('Image uploaded successfully:', imageUrl);
          alert(`Image URL: ${imageUrl}`);

          // Prepare data for the post
          const postData = {
            title: formData.title,
            author_id: userId,
            body: formData.content,
            image_url: imageUrl
          };

          // // Post the data
          const newPost = await createPostData(postData);  // Changed from postData to createPostData
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
