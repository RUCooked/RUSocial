import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, ListGroup, Image, Spinner, Alert } from 'react-bootstrap';
import {
  PersonFill,
  EnvelopeFill,
  CameraFill,
  TrashFill,

  
  ShieldFill,
  PersonXFill,
  ArrowLeftShort,
} from 'react-bootstrap-icons';
import axios from 'axios';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { getAuthHeaders } from '../utils/getJWT';
import { uploadImage } from '../utils/imageUpload';

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
  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userId = user.id || attributes.sub;

      if (!userId) throw new Error('User ID not found in the current user data.');

      setUsername(user.username || 'Unknown User');
      setEmail(attributes.email || 'No email available');
      setCurrentUserId(userId);

      const userResponse = await axios.get(`https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user?id=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const parsedUser = JSON.parse(userResponse.data.body);

      const userData = parsedUser.users[0]
      const imageUrl = userData.image_url || null; 
      setProfilePicture(imageUrl);


      if (userData.blocked_ids) {
        let blockedIdsList;
        

        if (Array.isArray(userData.blocked_ids)) {
          blockedIdsList = userData.blocked_ids;
        } else if (typeof userData.blocked_ids === 'string') {
          blockedIdsList = userData.blocked_ids.trim() ? userData.blocked_ids.split(',') : [];
        } else {
          blockedIdsList = [];
        }
  

        blockedIdsList = blockedIdsList.filter(id => id && id.trim());
  
        if (blockedIdsList.length > 0) {
          const blockedUsersPromises = blockedIdsList.map(blockedId =>
            axios.get(`https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user?id=${blockedId}`, {
              headers: {
                'Content-Type': 'application/json',
              },
            })
          );
  
          try {
            const blockedUsersResponses = await Promise.all(blockedUsersPromises);
            
            const blockedUsersList = blockedUsersResponses
              .map(response => {
                try {
                  const parsedData = JSON.parse(response.data.body);
                  const user = parsedData.users[0];
                  return user ? {
                    id: user.id,
                    username: user.username
                  } : null;
                } catch (e) {
                  console.error('Error parsing blocked user data:', e);
                  return null;
                }
              })
              .filter(user => user !== null); 
  
            setBlockedUsers(blockedUsersList);
          } catch (err) {
            console.error('Error fetching blocked users details:', err);
            setBlockedUsers([]);
          }
        } else {
          setBlockedUsers([]);
        }
      } else {
        setBlockedUsers([]);
      }

      setError(null); 
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]; 
    if (!file) return;

    try {
      if (!currentUserId) throw new Error('User ID is not set.');

      const fileReader = new FileReader();
      fileReader.onloadend = async () => {
        try {
          const base64Image = fileReader.result.split(',')[1]; 
          const fileName = `${currentUserId}_${file.name}`;

          // Upload the image to S3 and get the URL
          const s3ImageUrl = await uploadImage(base64Image, fileName);
          console.log('Uploaded Image URL:', s3ImageUrl);

          const verifiedHeader = await getAuthHeaders();
          const requestBody = {
            id: currentUserId,
            image_url: s3ImageUrl,
          };

          const response = await fetch(
            `https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user`,
            {
              method: 'PUT',
              headers: verifiedHeader,
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to update profile picture');
          }

          setProfilePicture(s3ImageUrl);
          setUploadSuccess('Profile picture updated successfully!');
          setUploadError(null); 
        } catch (err) {
          console.error('Error uploading profile picture:', err);
          setUploadError('Failed to upload profile picture. Please try again.');
          setUploadSuccess(null);
        }
      };

      fileReader.readAsDataURL(file); 
    } catch (err) {
      console.error('Error preparing file for upload:', err);
      setUploadError('Failed to process the file. Please try again.');
      setUploadSuccess(null);
    }
  };

  const handleBlockUser = async () => {
    const usernameToBlock = prompt('Enter the username to block:');
    if (!usernameToBlock) return;

    try {
      const verifiedHeader = await getAuthHeaders();

      const getResponse = await fetch(
        `https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user?username=${usernameToBlock}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!getResponse.ok) throw new Error('Failed to fetch user ID');

      const responseData = await getResponse.json();
      const users = JSON.parse(responseData.body).users;
      const userToBlock = users.find((user) => user.username === usernameToBlock);

      if (!userToBlock || !userToBlock.id) {
        throw new Error('User ID not found for the provided username.');
      }

      const userIdToBlock = userToBlock.id;

      if (!currentUserId) throw new Error('Current user ID is not set.');

      const requestBody = {
        id: currentUserId,
        blocked_id: userIdToBlock,
      };

      const putResponse = await fetch(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user',
        {
          method: 'PUT',
          headers: verifiedHeader,
          body: JSON.stringify(requestBody),
        }
      );

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

      if (!currentUserId) throw new Error('Current user ID is not set.');
      if (!userIdToUnblock) throw new Error('User ID to unblock is not provided.');

      const requestBody = {
        id: currentUserId,
        unblocked_id: userIdToUnblock,
      };

      const response = await fetch(
        'https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/user',
        {
          method: 'PUT',
          headers: verifiedHeader,
          body: JSON.stringify(requestBody),
        }
      );

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
              <Form.Control type="text" value={username} disabled readOnly className="bg-light" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <CameraFill className="text-danger me-2" /> Profile Picture
              </Form.Label>
              {profilePicture ? (
                <Image
                  src={profilePicture}
                  roundedCircle
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  className="mb-3"
                />
                
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