// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// function CreatePost({ addPost }) {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const navigate = useNavigate();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     addPost({ title, content });
//     navigate('/forum');
//   };

//   return (
//     <div>
//       <header style={styles.header}>
//         <div style={styles.logo}>
//           <img 
//             src="https://a.espncdn.com/guid/3f06733d-8d8a-7044-6b24-e0ba817e25f0/logos/primary_logo_on_white_color.png" 
//             alt="Rutgers Logo"
//             style={styles.rutgersLogo}
//           />
//         </div>
//         <div style={styles.brand}>
//           <h1>KnightMarket</h1>
//           <p style={styles.tagline}>Share your thoughts and connect with the campus</p>
//         </div>
//         <nav style={styles.nav}>
//           <Link to="/" style={styles.navLink}>
//             <img src="https://via.placeholder.com/20" alt="Home Icon" style={styles.icon} /> Home
//           </Link>
//           <Link to="/marketplace" style={styles.navLink}>
//             <img src="https://via.placeholder.com/20" alt="Marketplace Icon" style={styles.icon} /> Marketplace
//           </Link>
//           <Link to="/forum" style={styles.navLink}>
//             <img src="https://via.placeholder.com/20" alt="Forum Icon" style={styles.icon} /> Forum
//           </Link>
//           <Link to="/messages" style={styles.navLink}>
//             <img src="https://via.placeholder.com/20" alt="Messages Icon" style={styles.icon} /> Messages
//           </Link>
//         </nav>
//         <div style={styles.userProfile}>
//           <img
//             src="rusocial_frontend_reactjs/src/pages/user-profile.png" 
//             alt="User Profile"
//             style={styles.profilePic}
//           />
//           <button style={styles.dropdownButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
//             ▼
//           </button>
//           {dropdownOpen && (
//             <div style={styles.dropdownContent}>
//               <Link to="/settings" style={styles.dropdownLink}>Settings</Link>
//               <Link to="/profile" style={styles.dropdownLink}>User Profile</Link>
//               <Link to="/logout" style={styles.dropdownLink}>Log Out</Link>
//             </div>
//           )}
//         </div>
//       </header>
//       <main style={styles.mainContent}>
//         <div style={styles.container}>
//           <h2>Create a New Post</h2>
//           <form onSubmit={handleSubmit} style={styles.form}>
//             <div style={styles.formGroup}>
//               <label>Title:</label>
//               <input 
//                 type="text" 
//                 value={title} 
//                 onChange={(e) => setTitle(e.target.value)} 
//                 required 
//                 style={styles.input}
//               />
//             </div>
//             <div style={styles.formGroup}>
//               <label>Content:</label>
//               <textarea 
//                 value={content} 
//                 onChange={(e) => setContent(e.target.value)} 
//                 required 
//                 style={styles.textarea}
//               />
//             </div>
//             <button type="submit" style={styles.button}>Add Post</button>
//           </form>
//         </div>
//       </main>
//     </div>
//   );
// }

// const styles = {
//   header: {
//     backgroundColor: '#b22222',
//     color: 'white',
//     padding: '10px 20px',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     position: 'relative',
//     fontFamily: "'Roboto', sans-serif",
//   },
//   logo: {
//     position: 'absolute',
//     left: '20px',
//     top: '10px',
//   },
//   rutgersLogo: {
//     width: '50px',
//   },
//   brand: {
//     fontWeight: 'bold',
//     color: 'black',
//     textAlign: 'center',
//     margin: '0',
//   },
//   tagline: {
//     fontSize: '14px',
//     color: 'white',
//   },
//   nav: {
//     display: 'flex',
//     gap: '20px',
//     marginTop: '10px',
//   },
//   navLink: {
//     color: 'white',
//     textDecoration: 'none',
//     fontWeight: 'bold',
//     position: 'relative',
//     display: 'flex',
//     alignItems: 'center',
//   },
//   icon: {
//     marginRight: '8px',
//   },
//   userProfile: {
//     display: 'flex',
//     alignItems: 'center',
//     position: 'absolute',
//     right: '20px',
//     top: '10px',
//   },
//   profilePic: {
//     borderRadius: '50%',
//     width: '40px',
//     height: '40px',
//     cursor: 'pointer',
//   },
//   dropdownButton: {
//     backgroundColor: 'transparent',
//     border: 'none',
//     color: 'white',
//     cursor: 'pointer',
//     fontSize: '16px',
//     marginLeft: '5px',
//   },
//   dropdownContent: {
//     display: 'block',
//     position: 'absolute',
//     right: 0,
//     top: '50px',
//     backgroundColor: 'white',
//     boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
//     zIndex: 1,
//     borderRadius: '4px',
//   },
//   dropdownLink: {
//     color: 'black',
//     padding: '10px 20px',
//     textDecoration: 'none',
//     display: 'block',
//   },
//   mainContent: {
//     padding: '20px',
//   },
//   container: {
//     maxWidth: '600px',
//     margin: '0 auto',
//     padding: '20px',
//     border: '1px solid #ccc',
//     borderRadius: '8px',
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//   },
//   formGroup: {
//     marginBottom: '15px',
//   },
//   input: {
//     padding: '10px',
//     borderRadius: '4px',
//     border: '1px solid #ccc',
//     width: '100%',
//   },
//   textarea: {
//     padding: '10px',
//     borderRadius: '4px',
//     border: '1px solid #ccc',
//     width: '100%',
//     height: '150px',
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     padding: '10px',
//     cursor: 'pointer',
//   },
// };

// export default CreatePost;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';

function CreatePost({ addPost }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      ...formData,
      author: 'Current User', // This should come from auth context
      date: new Date().toISOString(),
      comments: 0
    };
    addPost(newPost);
    navigate('/forum');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Create New Post</h2>
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter post title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Write your post content here..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Image:</Form.Label>
              <div className="outline- btn d-flex gap-2 justify-content-start">
                <Form.Control type="file" multiple/>
              </div>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => navigate('/forum')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Post
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreatePost;