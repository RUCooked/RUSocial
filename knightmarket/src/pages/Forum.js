import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { PlusCircle, ChatLeftText } from 'react-bootstrap-icons';
import { getAuthHeaders } from '../utils/getJWT';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthorized = true;

  // Fetch posts from API
  const fetchPosts = async () => {
    const verifiedHeader = await getAuthHeaders();
    try {
      const response = await axios.get(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/forum/',
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const parsedBody = JSON.parse(response.data.body);
        const apiListings = parsedBody.map(post => ({
          id: post.postsId,
          title: post.title,
          body: post.body,
          images: post.images_url || [],
          datePosted: post.date_posted,
          updatedAt: post.updated_at
        }));

        setPosts(apiListings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
      }
    };
  
    useEffect(() => {
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
            <Card key={post.id} className="shadow-sm" style={{ width: '18rem' }}>
              <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Posted by {post.author?.username || 'Unknown'} on{' '}
                  {new Date(post.created_at).toLocaleDateString()}
                </Card.Subtitle>
                <Card.Text>
                  {post.body.length > 100
                    ? `${post.body.slice(0, 100)}...`
                    : post.body}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="secondary">
                    <ChatLeftText size={14} /> {post.comments?.comments || 'No Comments'}
                  </Badge>
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to={`/post/${post.id}`}
                    size="sm"
                  >
                    Read More
                  </Button>
                </div>
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
