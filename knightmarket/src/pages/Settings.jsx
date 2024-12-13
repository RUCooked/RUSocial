import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, ListGroup, Image } from 'react-bootstrap';
import {
  PersonFill,
  LockFill,
  EnvelopeFill,
  CameraFill,
  TrashFill,
  ShieldFill,
  PersonXFill,
  ArrowLeftShort,
  SaveFill,
  PencilFill,
} from 'react-bootstrap-icons';

function Settings() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('CurrentUsername');
  const [displayName, setDisplayName] = useState('Current Display Name');
  const [profilePicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState('user@rutgers.edu');
  const [password, setPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Edit mode states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);

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
  {isEditingUsername ? (
    <div className="d-flex gap-2">
      <Form.Control
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button
        variant="success"
        className="d-flex align-items-center"
        onClick={() => setIsEditingUsername(false)}
      >
        <SaveFill /> Save
      </Button>
    </div>
  ) : (
    <div className="d-flex justify-content-between align-items-center">
      <span>{username}</span>
      <Button
        variant="danger" // Changed to red
        size="sm"
        onClick={() => setIsEditingUsername(true)}
        className="d-flex align-items-center gap-1"
      >
        <PencilFill /> Edit
      </Button>
    </div>
  )}
</Form.Group>
            {/* Display Name */}
<Form.Group className="mb-3">
  <Form.Label className="d-flex align-items-center">
    <PersonFill className="text-danger me-2" /> Display Name
  </Form.Label>
  {isEditingDisplayName ? (
    <div className="d-flex gap-2">
      <Form.Control
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <Button
        variant="success"
        className="d-flex align-items-center"
        onClick={() => setIsEditingDisplayName(false)}
      >
        <SaveFill /> Save
      </Button>
    </div>
  ) : (
    <div className="d-flex justify-content-between align-items-center">
      <span>{displayName}</span>
      <Button
        variant="danger" // Changed to red
        size="sm"
        onClick={() => setIsEditingDisplayName(true)}
        className="d-flex align-items-center gap-1"
      >
        <PencilFill /> Edit
      </Button>
    </div>
  )}
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

      {/* Security Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white">
          <h2 className="h5 mb-0 d-flex align-items-center text-danger">
            <LockFill className="me-2" /> Security & Access
          </h2>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <LockFill className="text-danger me-2" /> Change Password
              </Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Form.Group>

            {/* Two-Factor Authentication */}
            <Form.Check
              type="checkbox"
              id="two-factor-auth"
              label="Enable Two-Factor Authentication"
              checked={twoFactorAuth}
              onChange={() => setTwoFactorAuth(!twoFactorAuth)}
              className="mb-3 d-flex align-items-center gap-2"
            />
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