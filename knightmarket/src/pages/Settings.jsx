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
import { getAuthHeaders } from '../utils/getJWT';

function Settings() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]); // Array of blocked user objects with id and username
  const [currentUserId, setCurrentUserId] = useState(null); // State to store current user ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Global error for fetching data
  const [blockUserError, setBlockUserError] = useState(null); // Error for blocking users
  const [unblockUserError, setUnblockUserError] = useState(null); // Error for unblocking users
  const [uploadError, setUploadError] = useState(null); // Error for profile picture upload
  const [uploadSuccess, setUploadSuccess] = useState(null); // Success message for profile picture upload

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userId = user.id || attributes.sub;

      if (!userId) {
        throw new Error('User ID not found in the current user data.');
      }

      setUsername(user.username || 'Unknown User');
      setEmail(attributes.email || 'No email available');
      setCurrentUserId(userId);

      // Fetch profile picture
      const imageUrl = attributes.picture || null; // Assuming `picture` is the key for the profile picture URL
      setProfilePicture(imageUrl);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again later.');
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const verifiedHeader = await getAuthHeaders();

      const formData = new FormData();
      formData.append('file', file); // Attach the file

      const response = await fetch(`https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user/${currentUserId}/profile-picture`, {
        method: 'POST', // or 'PUT' based on your backend implementation
        headers: verifiedHeader,
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Failed to upload profile picture');
      }

      const data = await response.json();

      // Update the profile picture URL in the state
      setProfilePicture(data.imageUrl); // Assuming the backend returns the updated image URL
      setUploadSuccess('Profile picture updated successfully!');
      setUploadError(null);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setUploadError('Failed to upload profile picture. Please try again.');
      setUploadSuccess(null);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch blocked users');
      const data = await response.json();

      const blockedUsersList = data.blockedUsers || [];
      setBlockedUsers(blockedUsersList);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
      setError('Failed to fetch blocked users.');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchBlockedUsers();
  }, []);

  const handleBlockUser = async () => {
    const usernameToBlock = prompt('Enter the username to block:');
    if (!usernameToBlock) return;

    try {
      const verifiedHeader = await getAuthHeaders();

      const getResponse = await fetch(`https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user?username=${usernameToBlock}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!getResponse.ok) throw new Error('Failed to fetch user ID');

      const responseData = await getResponse.json();
      const users = JSON.parse(responseData.body).users;
      const userToBlock = users.find(user => user.username === usernameToBlock);

      if (!userToBlock || !userToBlock.id) {
        throw new Error('User ID not found for the provided username.');
      }

      const userIdToBlock = userToBlock.id;

      if (!currentUserId) throw new Error('Current user ID is not set.');

      const requestBody = {
        id: currentUserId,
        blocked_id: userIdToBlock,
      };

      const putResponse = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user', {
        method: 'PUT',
        headers: verifiedHeader,
        body: JSON.stringify(requestBody),
      });

      if (!putResponse.ok) {
        const errorResponse = await putResponse.json();
        throw new Error(errorResponse.message || 'Failed to block user');
      }

      setBlockedUsers((prev) => [...prev, { id: userIdToBlock, username: usernameToBlock }]);
      setBlockUserError(null);
    } catch (err) {
      console.error('Error blocking user:', err);
      setBlockUserError('Failed to block user. Please try again.');
    }
  };

  const handleUnblockUser = async (userIdToUnblock) => {
    try {
      const verifiedHeader = await getAuthHeaders();

      if (!currentUserId) {
        throw new Error('Current user ID is not set.');
      }
      if (!userIdToUnblock) {
        throw new Error('User ID to unblock is not provided.');
      }

      const requestBody = {
        id: currentUserId,
        unblocked_id: userIdToUnblock,
      };

      const response = await fetch('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user', {
        method: 'PUT',
        headers: verifiedHeader,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Failed to unblock user');
      }

      setBlockedUsers((prev) => prev.filter((user) => user.id !== userIdToUnblock));
      setUnblockUserError(null);
    } catch (err) {
      console.error('Error unblocking user:', err);
      setUnblockUserError('Failed to unblock user. Please try again.');
    }
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
      <Button
        variant="danger"
        onClick={() => navigate(-1)}
        className="d-flex align-items-center gap-2 mb-4"
      >
        <ArrowLeftShort size={20} /> Back
      </Button>

      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <ShieldFill className="text-danger me-2" size={30} />
        <h1 className="mb-0">Settings</h1>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white">
          <h2 className="h5 mb-0 d-flex align-items-center text-danger">
            <PersonFill className="me-2" /> Profile Basics
          </h2>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <PersonFill className="text-danger me-2" /> Username
              </Form.Label>
              <Form.Control type="text" value={username} readOnly className="bg-light" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <CameraFill className="text-danger me-2" /> Profile Picture
              </Form.Label>
              {profilePicture ? (
                <Image src={profilePicture} roundedCircle width={80} height={80} className="mb-3" />
              ) : (
                <div className="mb-3">No profile picture uploaded</div>
              )}
              <Form.Control type="file" onChange={handleProfilePictureUpload} />
              {uploadSuccess && <Alert variant="success" className="mt-3">{uploadSuccess}</Alert>}
              {uploadError && <Alert variant="danger" className="mt-3">{uploadError}</Alert>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <EnvelopeFill className="text-danger me-2" /> Primary Contact Email
              </Form.Label>
              <Form.Control type="email" value={email} disabled readOnly className="bg-light" />
              <Form.Text className="text-muted">
                Email cannot be changed as it is linked to your account.
              </Form.Text>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h2 className="h5 mb-0 d-flex align-items-center text-danger">
            <PersonXFill className="me-2" /> Privacy Controls
          </h2>
        </Card.Header>
        <Card.Body>
          {blockUserError && <Alert variant="danger">{blockUserError}</Alert>}
          <Button
            variant="danger"
            onClick={handleBlockUser}
            className="d-flex align-items-center gap-2 mb-3"
          >
            <PersonXFill /> Block User By Username
          </Button>
          {unblockUserError && <Alert variant="danger">{unblockUserError}</Alert>}
          <ListGroup>
            {blockedUsers.map((user, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between align-items-center"
              >
                {user.username}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUnblockUser(user.id)}
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