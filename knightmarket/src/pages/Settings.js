import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { FaUser, FaLock, FaEnvelope, FaCamera, FaTrash, FaShieldAlt, FaUserSlash, FaArrowLeft } from 'react-icons/fa'; // Import icons

function Settings() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

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
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowLeft style={styles.backButtonIcon} /> Back
      </button>

      <h1 style={styles.mainHeading}>
        <FaShieldAlt style={styles.icon} /> Settings
      </h1>

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>
          <FaUser style={styles.icon} /> Profile Basics
        </h2>
        <label style={styles.label}>
          <FaUser style={styles.labelIcon} /> Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            placeholder="Enter your username"
          />
        </label>
        <label style={styles.label}>
          <FaUser style={styles.labelIcon} /> Display Name:
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
            placeholder="Enter your display name"
          />
        </label>
        <label style={styles.label}>
          <FaCamera style={styles.labelIcon} /> Profile Picture:
          <input type="file" onChange={handleFileUpload} style={styles.input} />
        </label>
        {profilePicture && (
          <img
            src={profilePicture}
            alt="Profile"
            style={styles.profilePic}
          />
        )}
        <label style={styles.label}>
          <FaEnvelope style={styles.labelIcon} /> Primary Contact Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Enter your email"
          />
        </label>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>
          <FaLock style={styles.icon} /> Security & Access
        </h2>
        <label style={styles.label}>
          <FaLock style={styles.labelIcon} /> Change Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Enter new password"
          />
        </label>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={twoFactorAuth}
            onChange={() => setTwoFactorAuth(!twoFactorAuth)}
            style={styles.checkbox}
          />
          Enable Two-Factor Authentication
        </label>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>
          <FaUserSlash style={styles.icon} /> Privacy Controls
        </h2>
        <button onClick={handleBlockUser} style={styles.button}>
          <FaTrash style={styles.buttonIcon} /> Block User By Username
        </button>
        <ul style={styles.blockedList}>
          {blockedUsers.map((user, index) => (
            <li key={index} style={styles.blockedUser}>
              {user}{' '}
              <button
                onClick={() => handleUnblockUser(user)}
                style={styles.unblockButton}
              >
                <FaTrash style={styles.buttonIcon} /> Unblock
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    margin: '20px auto',
    padding: '20px',
    maxWidth: '1000px',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: '#f4f4f4',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'left',
  },
  backButton: {
    padding: '10px 15px',
    backgroundColor: '#b22222',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backButtonIcon: {
    marginRight: '8px',
  },
  mainHeading: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionHeading: {
    fontSize: '1.5rem',
    color: '#b22222',
    marginBottom: '10px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    display: 'block',
    marginBottom: '15px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
  },
  labelIcon: {
    marginRight: '8px',
    color: '#b22222',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    fontSize: '1rem',
    color: '#555',
  },
  checkbox: {
    marginRight: '10px',
  },
  profilePic: {
    display: 'block',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    margin: '10px 0',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#b22222',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
  },
  buttonIcon: {
    marginRight: '8px',
  },
  unblockButton: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  blockedList: {
    listStyleType: 'none',
    padding: '0',
  },
  blockedUser: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '1rem',
    borderBottom: '1px solid #ddd',
    paddingBottom: '5px',
  },
  icon: {
    marginRight: '10px',
  },
};

export default Settings;