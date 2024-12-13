import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core'; 
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
import { addUserToDatabase } from './utils/addUserToDb'

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
    const listener = Hub.listen('auth', async (data) => {
      console.log('Auth event:', data);
      const { event, data: eventData } = data.payload;
      
      try {
        switch (event) {
          case 'signedIn':
            console.log('signedIn event:', eventData);
            if (eventData?.username) {
              const userAttributes = await fetchUserAttributes();
              console.log('User attributes:', userAttributes);

              await addUserToDatabase({
                username: eventData.username,
                user_id: eventData.userId,
                email: userAttributes.email,
              });
              console.log('Successfully added user to database');
            }
            break;
          default:
            console.log('Other auth event:', event, eventData);
        }
      } catch (error) {
        console.error('Error handling auth event:', event, error);
      }
    });

    return () => listener();
  }, []);

  return null;
}

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