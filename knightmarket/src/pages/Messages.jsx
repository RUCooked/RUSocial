import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Messages({ currentUser }) {
  currentUser = "testuser1"; // Placeholder; replace with dynamic user retrieval
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/conversation',
        { params: { user1: currentUser } }
      );

      const conversationsData = JSON.parse(response.data.body); // Ensure body contains array of strings
      if (Array.isArray(conversationsData) && conversationsData.length > 0) {
        const conversationList = conversationsData.map((filePath) => {
          const fileName = filePath.split('/').pop().replace('.json', '');
          const otherUser = fileName.replace(currentUser, '').replace('_', '');
          return { otherUser, filePath };
        });
        setConversations(conversationList);
      } else {
        setError('No conversations found.');
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

          {loading && <Spinner animation="border" variant="primary" />}
          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && conversations.length > 0 && (
            <div>
              {conversations.map((conversation, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Card.Title>{conversation.otherUser}</Card.Title>
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate('/DirectMessages', {
                          state: { currentUser, otherUser: conversation.otherUser },
                        })
                      }
                    >
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
