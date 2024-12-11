import React from 'react';
import { Container } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Welcome to KnightMarket</h2>
      <p className="text-muted">
        Discover the best deals on campus and connect with fellow students.
      </p>
      {/* Add your main content here */}
    </Container>
  );
};

export default Home;