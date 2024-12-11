import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function MakeListing({ addListing }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onloadend = () => {
      // Add the new listing
      addListing({ title, description, image: reader.result });
      // Navigate back to the marketplace
      navigate('/marketplace');
    };
    if (image) {
      reader.readAsDataURL(image);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div>
      <header style={styles.header}>
        <div style={styles.logo}>
          <img 
            src="https://a.espncdn.com/guid/3f06733d-8d8a-7044-6b24-e0ba817e25f0/logos/primary_logo_on_white_color.png" // Rutgers logo URL, adjust accordingly
            alt="Rutgers Logo"
            style={styles.rutgersLogo}
          />
        </div>
        <div style={styles.brand}>
          <h1>KnightMarket</h1>
          <p style={styles.tagline}>Create your listing and connect with the campus</p>
        </div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>
            <img src="https://via.placeholder.com/20" alt="Home Icon" style={styles.icon} /> Home
          </Link>
          <Link to="/marketplace" style={styles.navLink}>
            <img src="https://via.placeholder.com/20" alt="Marketplace Icon" style={styles.icon} /> Marketplace
          </Link>
          <Link to="/forum" style={styles.navLink}>
            <img src="https://via.placeholder.com/20" alt="Forum Icon" style={styles.icon} /> Forum
          </Link>
          <Link to="/messages" style={styles.navLink}>
            <img src="https://via.placeholder.com/20" alt="Messages Icon" style={styles.icon} /> Messages
          </Link>
        </nav>
        <div style={styles.userProfile}>
          <img
            src="rusocial_frontend_reactjs/src/pages/user-profile.png" // Placeholder image, replace with actual user profile image
            alt="User Profile"
            style={styles.profilePic}
          />
          <button style={styles.dropdownButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
            ▼
          </button>
          {dropdownOpen && (
            <div style={styles.dropdownContent}>
              <Link to="/settings" style={styles.dropdownLink}>Settings</Link>
              <Link to="/profile" style={styles.dropdownLink}>User Profile</Link>
              <Link to="/logout" style={styles.dropdownLink}>Log Out</Link>
            </div>
          )}
        </div>
      </header>
      <main style={styles.mainContent}>
        <div style={styles.container}>
          <h2>Create a New Listing</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Title:</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Description:</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Upload Image:</label>
              <input 
                type="file" 
                onChange={handleImageChange} 
                required 
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.button}>Add Listing</button>
          </form>
        </div>
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#b22222', // Darker shade of red
    color: 'white',
    padding: '10px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    fontFamily: "'Roboto', sans-serif",
  },
  logo: {
    position: 'absolute',
    left: '20px',
    top: '10px',
  },
  rutgersLogo: {
    width: '50px',
  },
  brand: {
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    margin: '0',
  },
  tagline: {
    fontSize: '14px',
    color: 'white',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '8px',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    right: '20px',
    top: '10px',
  },
  profilePic: {
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
  },
  dropdownButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '5px',
  },
  dropdownContent: {
    display: 'block',
    position: 'absolute',
    right: 0,
    top: '50px',
    backgroundColor: 'white',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    zIndex: 1,
    borderRadius: '4px',
  },
  dropdownLink: {
    color: 'black',
    padding: '10px 20px',
    textDecoration: 'none',
    display: 'block',
  },
  mainContent: {
    padding: '20px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px',
    cursor: 'pointer',
  },
};

export default MakeListing;
