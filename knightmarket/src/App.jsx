import React from 'react'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import Home from './pages/Home'; 
import { NavigationBar } from './components';
import Marketplace from './pages/Marketplace'; 
import MakeListing from './pages/makeListing'; 
import Forum from './pages/Forum'; // Import Forum component
import CreatePost from './pages/createPost'; // Import CreatePost component
import Settings from './pages/Settings'; // Adjust path as needed
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/make-listing" element={<MakeListing />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;