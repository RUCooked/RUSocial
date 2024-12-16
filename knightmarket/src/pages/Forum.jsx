import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import { getAuthHeaders } from '../utils/getJWT';


function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">Forum</h2>
          <p className="text-muted">Join the conversation with fellow students</p>
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
            console.log("this is an image" + post.image_url),
            <Card key={post.id} className="shadow-sm" style={{ width: '18rem' }}>
              <Card.Body>
                {/* Display the post image from the image_url */}
                {post.image_url && (
                  <img
                    src={post.image_url} // Use the correct image URL
                    alt={post.title}
                    className="img-fluid mb-3"
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                )}
                
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>
                  {post.body.length > 100
                    ? `${post.body.slice(0, 100)}...`
                    : post.body}
                </Card.Text>
                <Button
                  variant="outline-primary"
                  as={Link}
                  to={`/post/${post.id}`}
                  size="sm"
                >
                  Read More
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        !loading && <p>No posts available.</p>
      )}
    </Container>
  );
}

export default Forum;