import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

function DirectMessage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser, otherUser } = state || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch messages from the API
  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/messages',
        {
          params: { user1: currentUser, user2: otherUser },
        }
      );

      console.log('API Response:', response.data);

      // Ensure `body` is parsed correctly
      const responseBody = JSON.parse(response.data.body || '{}');
      const conversation = responseBody.messages || [];
      setMessages(conversation);
    } catch (err) {
      console.error('Error fetching messages:', err.message);
      setError('Failed to fetch messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const newMessageData = {
        user1: currentUser,
        user2: otherUser,
        message: newMessage,
      };

      // POST request to the API
      console.log(JSON.stringify(newMessageData));
      const response = await axios.post(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/messages',
        JSON.stringify(newMessageData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Message sent:', response.data);

      // Update the local state to reflect the new message
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: currentUser, content: newMessage, timestamp: new Date().toISOString() },
      ]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err.message);
      setError('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    if (currentUser && otherUser) {
      fetchMessages();
    } else {
      setError('Invalid user information.');
    }
  }, [currentUser, otherUser]);

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Return to Messages
          </Button>
          <h2>Conversation with {otherUser || 'Unknown User'}</h2>

          {loading && <Spinner animation="border" variant="primary" />}
          {error && <p className="text-danger">{error}</p>}

          {/* Display Messages */}
          {!loading && !error && Array.isArray(messages) && messages.length > 0 && (
            <div>
              {messages.map((msg, index) => (
                <Card key={index} className="mb-2">
                  <Card.Body>
                    <strong>{msg.sender}</strong>: {msg.content}
                    <div className="text-muted small">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* No Messages */}
          {!loading && !error && messages.length === 0 && (
            <p className="text-muted">No messages yet. Start the conversation!</p>
          )}

          {/* Message Input Form */}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <Form.Group controlId="messageInput" className="my-3">
              <Form.Control
                type="text"
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Send
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default DirectMessage;
