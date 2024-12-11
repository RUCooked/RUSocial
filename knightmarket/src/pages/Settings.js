import React, { useState } from 'react';

function Settings() {
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
      <h1 style={styles.mainHeading}>Settings</h1>

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Profile Basics</h2>
        <label style={styles.label}>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Display Name:
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Profile Picture:
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
          Primary Contact Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </label>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionHeading}>Security & Access</h2>
        <label style={styles.label}>
          Change Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
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
        <h2 style={styles.sectionHeading}>Privacy Controls</h2>
        <button onClick={handleBlockUser} style={styles.button}>
          Block User By Username
        </button>
        <ul style={styles.blockedList}>
          {blockedUsers.map((user, index) => (
            <li key={index} style={styles.blockedUser}>
              {user}{' '}
              <button
                onClick={() => handleUnblockUser(user)}
                style={styles.unblockButton}
              >
                Unblock
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
    margin: '50px',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  mainHeading: {
    textAlign: 'center',
    fontSize: '2.5em',
    marginBottom: '20px',
    color: '#333',
  },
  card: {
    marginLeft: '10em',
    marginRight: '10em',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  sectionHeading: {
    fontSize: '1.5em',
    color: '#b22222',
    marginBottom: '15px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px',
  },
  label: {
    marginRight: '16em',
    marginLeft: '16em',
    display: 'block',
    marginBottom: '10px',
    fontSize: '1em',
    fontWeight: 'bold',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    fontSize: '1em',
  },
  checkbox: {
    
    marginLeft: '15em',
  },
  profilePic: {
    display: 'block',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    margin: '10px 0',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#b22222',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  unblockButton: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginLeft: '10px',
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
    fontSize: '1em',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '5px',
  },
};

export default Settings;