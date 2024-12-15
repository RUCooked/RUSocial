import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Accordion,
  Form,
  Image,
  ListGroup,
  Spinner
} from 'react-bootstrap';
import {
  PersonFill,
  EnvelopeFill,
  PeopleFill,
  ShieldFill,
  Shop,
  ChatSquareText,
  PencilSquare
} from 'react-bootstrap-icons';
import { getCurrentUser } from '@aws-amplify/auth';
import { getAuthHeaders } from '../utils/getJWT';
import { API_ENDPOINTS } from '../config/apis';

// New component for editable bio
const EditableBio = ({ bio, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(bio);

  const handleSave = async () => {
    await onSave(newBio);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mb-3">
        <Form.Control
          as="textarea"
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
        />
        <div className="mt-2">
          <Button variant="danger" size="sm" onClick={handleSave} className="me-2">
            Save
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className="mb-3" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
      {bio || 'Click to add bio...'}
      <PencilSquare size={12} className="ms-2 text-muted" />
    </p>
  );
};

const UserProfile = () => {
  // Get userId from URL parameters for viewing other profiles
  const { userId: profileId } = useParams();
  const navigate = useNavigate();

  // State management for all profile data and UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Mock data for marketplace posts - replace with API data later
  const marketplacePosts = [
    { id: 1, title: "Calculus Textbook", price: "$45", date: "2024-03-15" },
    { id: 2, title: "Desk Lamp", price: "$15", date: "2024-03-10" },
  ];

  // Mock data for forum posts - replace with API data later
  const forumPosts = [
    { id: 1, title: "Best study spots on campus?", replies: 12, date: "2024-03-14" },
    { id: 2, title: "Looking for CS study group", replies: 8, date: "2024-03-12" },
  ];

  // Load profile data when component mounts or when profileId changes
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user info
        const loggedInUser = await getCurrentUser();
        setCurrentUser(loggedInUser);

        // Determine which profile to load
        const targetUserId = profileId || loggedInUser.userId;
        setIsOwnProfile(!profileId || profileId === loggedInUser.userId);

        // Fetch profile data
        const response = await fetch(`${API_ENDPOINTS.USERS}?id=${targetUserId}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const rawData = await response.json();
        // Parse the body string into an object
        const parsedData = JSON.parse(rawData.body);
        // Now we can access the users array
        const userData = parsedData.users[0];

        // Transform the data to match our component's expected structure
        const transformedData = {
          username: userData.username,
          email: userData.email,
          bio: userData.bio || 'No bio yet',
          profilePicture: userData.image_url || "/api/placeholder/150/150",
          userId: userData.id,
          createdAt: userData.created_at,
          stats: {
            followers: userData.followers || 0,
            following: userData.following || 0,
            marketplacePosts: 0,
            forumPosts: 0,
            blockedUsers: 0,
            posts: Number(forumPosts + marketplacePosts),
          }
        };

        setProfileData(transformedData);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [profileId]);

  const updateBio = async (newBio) => {

    const verifiedHeader = await getAuthHeaders();
    try {

      const response = await fetch(`${API_ENDPOINTS.USERS}`, {
        method: 'PUT',
        headers: verifiedHeader,
        body: JSON.stringify({
          id: currentUser.usedrId,
          bio: newBio
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update bio');
      }

      // Update local state
      setProfileData(prev => ({
        ...prev,
        bio: newBio
      }));

    } catch (error) {
      console.error('Error updating bio:', error);
      // You might want to show an error message to the user
    }
  };

  // Handler for following/unfollowing users
  const handleFollow = async (targetUserId) => {
    const verifiedHeader = await getAuthHeaders();
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}`, {
        method: 'PUT',
        headers: verifiedHeader,
        body: JSON.stringify({
          id: currentUser.userId,
          follower_id: targetUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      // Update profile data to reflect new follow status
      setProfileData(prev => ({
        ...prev,
        isFollowing: !prev.isFollowing
      }));
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };







  // TODO: IMPLEMENT ACTUAL MESSAGES PAGE 
  const handleMessage = (targetUserId) => {
    navigate(`/messages/${targetUserId}`);
  };





  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  // Show error message if data fetch failed
  if (error) {
    return (
      <Container className="py-5 text-center">
        <div className="text-danger mb-3">
          <h4>Error Loading Profile</h4>
          <p>{error}</p>
        </div>
        <Button variant="outline-danger" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Don't render anything if profile data isn't available
  if (!profileData) return null;
  console.log(profileData);

  return (
    <Container className="py-4">
      {/* Profile Header Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3} className="text-center">
              <Image
                src={profileData.profilePicture || "/api/placeholder/150/150"}
                roundedCircle
                className="mb-3 shadow"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </Col>
            <Col md={6}>
              <h2 className="mb-1">{profileData.username}</h2>
              <p className="text-muted mb-2">@{profileData.email}</p>
              {isOwnProfile ? (
                <EditableBio bio={profileData.bio} onSave={updateBio} />
              ) : (
                <p className="mb-3">{profileData.bio}</p>
              )}
              <div className="d-flex gap-3 mb-3">
                <div className="text-center">
                  <h5 className="mb-0">{profileData.stats?.posts || 0}</h5>
                  <small className="text-muted">Posts</small>
                </div>
                <div className="text-center">
                  <h5 className="mb-0">{profileData.stats?.followers || 0}</h5>
                  <small className="text-muted">Followers</small>
                </div>
                <div className="text-center">
                  <h5 className="mb-0">{profileData.stats?.following || 0}</h5>
                  <small className="text-muted">Following</small>
                </div>
              </div>
            </Col>
            <Col md={3} className="text-md-end">
              {isOwnProfile ? (
                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={() => navigate('/settings')}
                >
                  <PencilSquare className="me-2" />
                  Edit User Settings
                </Button>
              ) : (
                <div className="d-grid gap-2">
                  <Button
                    variant="danger"
                    onClick={() => handleFollow(profileData.userId)}
                  >
                    {profileData.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleMessage(profileData.userId)}
                  >
                    Message
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* User Details Section */}
      <Row>
        <Col md={4}>
          {/* Contact Information Card */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Contact Information</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex align-items-center">
                <EnvelopeFill className="text-danger me-2" />
                {profileData.email}
              </ListGroup.Item>
              <ListGroup.Item className="d-flex align-items-center">
                <PersonFill className="text-danger me-2" />
                Member since {new Date(profileData.createdAt).toLocaleDateString()}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* Account Stats Card */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Account Stats</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <Shop className="text-danger me-2" />
                  Marketplace Posts
                </div>
                <Badge bg="secondary">{profileData.stats?.marketplacePosts || 0}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <ChatSquareText className="text-danger me-2" />
                  Forum Posts
                </div>
                <Badge bg="secondary">{profileData.stats?.forumPosts || 0}</Badge>
              </ListGroup.Item>
              {isOwnProfile && (
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <ShieldFill className="text-danger me-2" />
                    Blocked Users
                  </div>
                  <Badge bg="secondary">{profileData.stats?.blockedUsers || 0}</Badge>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
          {/* Marketplace Posts Accordion */}
          <Accordion className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <Shop className="me-2" /> Marketplace Listings
              </Accordion.Header>
              <Accordion.Body>
                <ListGroup>
                  {marketplacePosts.map(post => (
                    <ListGroup.Item
                      key={post.id}
                      className="d-flex justify-content-between align-items-center"
                      action
                      onClick={() => navigate(`/marketplace/listing/${post.id}`)}
                    >
                      <div>
                        <h6 className="mb-0">{post.title}</h6>
                        <small className="text-muted">{post.date}</small>
                      </div>
                      <Badge bg="success">{post.price}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Forum Posts Accordion */}
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <ChatSquareText className="me-2" /> Forum Posts
              </Accordion.Header>
              <Accordion.Body>
                <ListGroup>
                  {forumPosts.map(post => (
                    <ListGroup.Item
                      key={post.id}
                      className="d-flex justify-content-between align-items-center"
                      action
                      onClick={() => navigate(`/forum/post/${post.id}`)}
                    >
                      <div>
                        <h6 className="mb-0">{post.title}</h6>
                        <small className="text-muted">{post.date}</small>
                      </div>
                      <Badge bg="primary">{post.replies} replies</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;