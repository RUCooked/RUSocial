import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Messages({ currentUser }) {
  currentUser = "testuser1"; // Example current user
  const [conversations, setConversations] = useState([]);
  const [newUser, setNewUser] = useState(''); // Input for new user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');

  const navigate = useNavigate();

  // Function to fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching conversations for user:', currentUser);
      const response = await axios.get(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/conversation',
        {
          params: { user1: currentUser },
        }
      );
      console.log('API Response:', response.data);

      const conversationsData = JSON.parse(response.data.body); // Parse API response

      if (Array.isArray(conversationsData)) {
        if (conversationsData.length === 0) {
          setError('No conversations found.');
        } else {
          const conversationList = conversationsData.map((filePath) => {
            const fileName = filePath.split('/').pop().replace('.json', '');
            const otherUser = fileName.replace(currentUser, '').replace('_', '');
            return { otherUser, filePath };
          });
          setConversations(conversationList);
        }
      } else {
        throw new Error('API response body is not an array');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err.message);
      setError('Failed to fetch conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new conversation
  const createConversation = async () => {
    if (!newUser.trim()) {
      setCreateError('Please enter a valid username.');
      return;
    }

    try {
      setCreateError('');
      const newConversation = {
        user1: currentUser,
        user2: newUser,
      };

      // Send API request to create a new conversation
      console.log(JSON.stringify(newConversation));
      const response = await axios.post(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/conversation',
        JSON.stringify(newConversation),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Conversation created:', response.data);

      // Refresh the conversations list
      setNewUser('');
      fetchConversations();
    } catch (err) {
      console.error('Error creating conversation:', err.message);
      setCreateError('Failed to create a conversation. Please try again.');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h2>Conversations</h2>

          {/* Loading State */}
          {loading && <Spinner animation="border" variant="primary" />}

          {/* Error State */}
          {error && <p className="text-danger">{error}</p>}

          {/* Conversations List */}
          {!loading && !error && conversations.length > 0 && (
            <div>
              {conversations.map((conversation, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Card.Title>{conversation.otherUser}</Card.Title>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/directmessages', { state: { currentUser, otherUser: conversation.otherUser } })}
                    >
                      Open Conversation
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* No Conversations */}
          {!loading && !error && conversations.length === 0 && (
            <p className="text-muted">No conversations found. Start a new one!</p>
          )}

          {/* Create New Conversation */}
          <Card className="mt-4">
            <Card.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  createConversation();
                }}
              >
                <Form.Group controlId="newConversationInput">
                  <Form.Label>Start a New Conversation</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="mt-3">
                  Create Conversation
                </Button>
                {createError && <p className="text-danger mt-2">{createError}</p>}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Messages;
