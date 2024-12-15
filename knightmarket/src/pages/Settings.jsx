import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, ListGroup, Image, Spinner, Alert } from 'react-bootstrap';
import {
  PersonFill,
  LockFill,
  EnvelopeFill,
  CameraFill,
  TrashFill,
  ShieldFill,
  PersonXFill,
  ArrowLeftShort,
} from 'react-bootstrap-icons';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';

function Settings() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      // Fetch username from getCurrentUser
      const user = await getCurrentUser();
      console.log('Current User:', user);

      // Fetch email and other attributes from fetchUserAttributes
      const attributes = await fetchUserAttributes();
      console.log('User Attributes:', attributes);

      // Update state with fetched data
      setUsername(user.username || 'Unknown User');
      setEmail(attributes.email || 'No email available');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setProfilePicture(URL.createObjectURL(file));
  };

  const handleBlockUser = () => {
    const userToBlock = prompt('Enter the username to block:');
    if (userToBlock) {
      setBlockedUsers([...blockedUsers, userToBlock]);
    }
  };

  const handleUnblockUser = (username) => {
    setBlockedUsers(blockedUsers.filter((user) => user !== username));
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button
        variant="danger"
        onClick={() => navigate(-1)}
        className="d-flex align-items-center gap-2 mb-4"
      >
        <ArrowLeftShort size={20} /> Back
      </Button>

      {/* Header */}
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <ShieldFill className="text-danger me-2" size={30} />
        <h1 className="mb-0">Settings</h1>
      </div>

      {/* Profile Basics Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white">
          <h2 className="h5 mb-0 d-flex align-items-center text-danger">
            <PersonFill className="me-2" /> Profile Basics
          </h2>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Username */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <PersonFill className="text-danger me-2" /> Username
              </Form.Label>
              <Form.Control type="text" value={username} readOnly className="bg-light" />
            </Form.Group>

            {/* Profile Picture */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <CameraFill className="text-danger me-2" /> Profile Picture
              </Form.Label>
              <Form.Control type="file" onChange={handleFileUpload} />
            </Form.Group>

            {profilePicture && (
              <Image
                src={profilePicture}
                roundedCircle
                width={80}
                height={80}
                className="mb-3"
              />
            )}

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <EnvelopeFill className="text-danger me-2" /> Primary Contact Email
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                disabled
                readOnly
                className="bg-light"
              />
              <Form.Text className="text-muted">
                Email cannot be changed as it is linked to your Rutgers account.
              </Form.Text>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      {/* Privacy Controls Section */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h2 className="h5 mb-0 d-flex align-items-center text-danger">
            <PersonXFill className="me-2" /> Privacy Controls
          </h2>
        </Card.Header>
        <Card.Body>
          {/* Block User */}
          <Button
            variant="danger"
            onClick={handleBlockUser}
            className="d-flex align-items-center gap-2 mb-3"
          >
            <PersonXFill /> Block User By Username
          </Button>

          {/* Blocked Users List */}
          <ListGroup>
            {blockedUsers.map((user, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between align-items-center"
              >
                {user}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUnblockUser(user)}
                  className="d-flex align-items-center gap-2"
                >
                  <TrashFill /> Unblock
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Settings;