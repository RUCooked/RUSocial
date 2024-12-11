import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GenerateTiles from './generateTiles'; // Import GenerateTiles component

function Marketplace() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [listings, setListings] = useState([
    {
      id: 1,
      title: 'Item 1',
      description: 'This is a description for item 1.',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      title: 'Item 2',
      description: 'This is a description for item 2.',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 3,
      title: 'Item 3',
      description: 'This is a description for item 3.',
      image: 'https://via.placeholder.com/150'
    }
  ]); // Initial mock data

  const addListing = (newListing) => {
    setListings([...listings, { ...newListing, id: listings.length + 1 }]);
  };

  const isAuthorized = true; // Temporary authorization check

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
          <p style={styles.tagline}>Your one-stop shop for all campus needs</p>
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
            onClick={toggleDropdown}
          />
          <button style={styles.dropdownButton} onClick={toggleDropdown}>
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
        {/* Conditional rendering of Add Listing button */}
        {isAuthorized && (
          <Link to="/make-listing" style={styles.addButton}>
            Add Listing
          </Link>
        )}
        {/* Display tiles with current listings */}
        <GenerateTiles listings={listings} />
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
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    cursor: 'pointer',
    margin: '20px 0',
    textDecoration: 'none', // Ensure the button looks like a button, not a link
  },
};

export default Marketplace;
