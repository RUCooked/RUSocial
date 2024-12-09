import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home.js';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator, Authenticator } from '@aws-amplify/ui-react';

Amplify.configure(awsconfig);

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <div className="App">
            <button onClick={signOut}>Sign Out</button>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Add more routes here */}
            </Routes>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default withAuthenticator(App);
