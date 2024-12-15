import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

function Messages({ currentUser }) {
  currentUser = "testuser1";
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      // Check if the body is a valid JSON string
      const conversationsData = JSON.parse(response.data.body); // This should be an array of strings

      if (Array.isArray(conversationsData)) {
        if (conversationsData.length === 0) {
          setError('No conversations found.');
        } else {
          // Extract other user from each file name
          const conversationList = conversationsData.map((filePath) => {
            // Extract the other user from the filename (after the last slash and before ".json")
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
                    <Button variant="primary" onClick={() => alert(`Opening conversation with ${conversation.otherUser}`)}>
                      Open Conversation
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Messages;
