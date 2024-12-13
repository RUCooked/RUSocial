import React, { useState } from 'react';
import { uploadImage } from '../utils/imageUpload';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function CreatePost({ addPost, userId }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
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

  const createPostData = async (postData) => {
    try {
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/dev/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'username:password' // Replace with real credentials
        },
        body: JSON.stringify(postData)
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
          // const postData = {
          //   user_id: userId,
          //   title: formData.title,
          //   content: formData.content,
          //   image_url: imageUrl
          // };

          // // Post the data
          // const newPost = await createPostData(postData);  // Changed from postData to createPostData
          // console.log('Post created successfully:', newPost);

          // if (addPost) {
          //   addPost(newPost);
          // }

          // Navigate back to the forum
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
