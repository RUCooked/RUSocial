import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Amplify, Hub } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { NavigationBar } from './components';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import MakeListing from './pages/makeListing';
import Forum from './pages/Forum';
import CreatePost from './pages/createPost';
import Login from './pages/Login';
import Settings from './pages/Settings';
import addUserToDatabase from './utils/addUserToDb'

Amplify.configure(awsExports);

// Separate RequireAuth component
function RequireAuth({ children }) {
  const { user } = useAuthenticator();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return user ? children : null;
}

function AuthEventListener() {
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signUp':
          console.log('User signed up:', data);
          break;
        case 'signIn':
          console.log('User signed in:', data);
          break;
        case 'signUp_confirm_success':
          console.log('User confirmed signup, adding to database:', data);
          if (data.attributes) {
            addUserToDatabase(data.attributes);
          }
          break;
        case 'autoSignIn':
          console.log('Auto Sign In after Sign Up:', data);
          break;
        default:
          console.log('default');
      }
    });

    return () => listener(); // Cleanup
  }, []);

  return null;
}

// Main app layout component
function AppLayout() {
  return (
    <div className="App">
      <NavigationBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route
            path="/make-listing"
            element={
              <RequireAuth>
                <MakeListing />
              </RequireAuth>
            }
          />
          <Route path="/forum" element={<Forum />} />
          <Route
            path="/create-post"
            element={
              <RequireAuth>
                <CreatePost />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

// Main App component
function App() {
  return (
    <Authenticator.Provider>
      <AuthEventListener />
      <Router>
        <AppLayout />
      </Router>
    </Authenticator.Provider>
  );
}

export default App;