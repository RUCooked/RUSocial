import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
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
      <Router>
        <AppLayout />
      </Router>
    </Authenticator.Provider>
  );
}

export default App;