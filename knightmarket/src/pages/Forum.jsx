import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { PlusCircle, ChatLeftText } from 'react-bootstrap-icons';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthorized = true; // Mock authorization check
  console.log("mock auth because its not implemented yet go bother haider about this")
  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
     console.log("trying to fetch")
      try {
        const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/no-auth/forum/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log("response was NOT ok")
          throw new Error(response);
        }

        const data = await response.json();
        setPosts(data.posts || []);
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
        <div className="d-flex flex-column gap-3">
          {posts.map(post => (
            <Card key={post.id} className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Title className="mb-1">{post.title}</Card.Title>
                    <div className="text-muted small">
                      Posted by {post.author?.username || 'Unknown'} on{' '}
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge bg="secondary" className="d-flex align-items-center gap-1">
                    <ChatLeftText size={14} />
                    {post.comments?.comments || 'No Comments'}
                  </Badge>
                </div>
                <Card.Text>{post.body}</Card.Text>
                <div className="d-flex justify-content-end">
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