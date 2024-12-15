import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';

function DirectMessages({ user1, user2, onReturnToMessages }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/messages',
        {
          params: { user1, user2 },
        }
      );
      setMessages(response.data.messages || []);
    } catch (err) {
      setError('Failed to fetch messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      user1,
      user2,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/messages', newMsg);
      setMessages((prevMessages) => [...prevMessages, { ...newMsg, sender: user1 }]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user1, user2]);

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Button variant="secondary" onClick={onReturnToMessages} className="mb-3">
            Return to Messages
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Conversation between {user1} and {user2}</h4>
          {loading && <p>Loading messages...</p>}
          {error && <p className="text-danger">{error}</p>}
          <ListGroup>
            {messages.map((msg, idx) => (
              <ListGroup.Item key={idx}>
                <div>
                  <strong>{msg.sender === user1 ? 'You' : user2}</strong>:
                </div>
                <div>{msg.message}</div>
                <div className="text-muted small">{new Date(msg.timestamp).toLocaleString()}</div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button variant="primary" onClick={sendMessage}>
              Send
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default DirectMessages;
