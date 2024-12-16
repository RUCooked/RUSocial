import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Modal } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import { getAuthHeaders } from '../utils/getJWT';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image

  const isAuthorized = true; // Mock authorization check

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/no-auth/forum/',
          {
            method: 'GET',
            headers: {
              'credentials': 'masterknight:chickenNugget452!',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();

        // Log the full response to verify structure
        console.log('Full API Response:', data.body);

        // Parse the `body` key if it exists and set the posts
        const parsedBody = JSON.parse(data.body);
        setPosts(parsedBody.posts || []); // Use `posts` array from parsed `body`
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Function to handle image click
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">Forum</h2>
          <p className="text-muted">Share your thoughts, experiences, and ideas anonymously!</p>
        </div>
        {isAuthorized && (
          <Button
            as={Link}
            to="/create-post"
            variant="success"
            className="d-flex align-items-center gap-2"
          >
            <PlusCircle size={20} />
            Create Post
          </Button>
        )}
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading posts...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Posts Section */}
      {!loading && !error && posts.length > 0 ? (
        <div className="d-flex flex-wrap gap-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="shadow-sm"
              style={{
                width: '18rem',
                height: '22rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Card.Body>
                {/* Display the post image with consistent size */}
                {post.image_url && (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '10rem',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="img-fluid"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 0.3s ease',
                      }}
                      onClick={() => handleImageClick(post.image_url)} // Open modal on click
                    />
                    {/* Overlay for hover effect */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: '#fff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleImageClick(post.image_url)} // Open modal on click
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = 1; // Show overlay on hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = 0; // Hide overlay on leave
                      }}
                    >
                      Enlarge Image
                    </div>
                  </div>
                )}

                <Card.Title className="mt-3">{post.title}</Card.Title>
                <Card.Text>
                  {post.body.length > 100
                    ? `${post.body.slice(0, 100)}...`
                    : post.body}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        !loading && <p>No posts available.</p>
      )}

      {/* Image Modal */}
      <Modal show={!!selectedImage} onHide={handleCloseModal} centered>
        <Modal.Body>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full View"
              className="img-fluid"
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Forum;