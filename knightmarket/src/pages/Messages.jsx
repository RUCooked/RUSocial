import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = "testuser1"; // Replace with dynamic user if available

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        console.log('fortnite');
        const response = await axios.get(
          'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/conversation',
          {
            params: { user1: currentUser },
          }
        );

        if (response.data && response.data.conversations) {
          setConversations(response.data.conversations);
        } else {
          setError('No conversations found.');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err.message);
        setError('Failed to fetch conversations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading conversations...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Conversations</h2>
      <Row className="justify-content-center">
        {conversations.length > 0 ? (
          conversations.map((conv, index) => (
            <Col md={4} key={index} className="mb-3">
              <div className="p-3 border rounded">
                <h5>Conversation</h5>
                <p><strong>File:</strong> {conv.fileName}</p>
                <p><strong>Participants:</strong> {conv.participants.join(', ')}</p>
                <Button
                  variant="primary"
                  onClick={() => console.log(`Go to conversation: ${conv.fileName}`)}
                >
                  View Conversation
                </Button>
              </div>
            </Col>
          ))
        ) : (
          <Col md={6} className="text-center">
            <p>No conversations found.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default Messages;
