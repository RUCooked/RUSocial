import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { PlusCircle, ChatLeftText } from 'react-bootstrap-icons';

function Forum() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Welcome to the Forum!',
      content: 'Feel free to share anything related to KnightMarket here.',
      author: 'Admin',
      date: '2024-03-15',
      comments: 5
    },
    {
      id: 2,
      title: 'Announcement',
      content: 'We have updated our marketplace with new features.',
      author: 'Moderator',
      date: '2024-03-14',
      comments: 3
    }
  ]);

  const isAuthorized = true; // Mock authorization check

  const createPost = (newPost) => {
    setPosts([...posts, { ...newPost, id: posts.length + 1 }]);
  };

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

      {/* Posts Section */}
      <div className="d-flex flex-column gap-3">
        {posts.map(post => (
          <Card key={post.id} className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <Card.Title className="mb-1">{post.title}</Card.Title>
                  <div className="text-muted small">
                    Posted by {post.author} on {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <Badge bg="secondary" className="d-flex align-items-center gap-1">
                  <ChatLeftText size={14} />
                  {post.comments}
                </Badge>
              </div>
              <Card.Text>{post.content}</Card.Text>
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
    </Container>
  );
}

export default Forum;