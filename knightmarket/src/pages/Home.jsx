import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Shop, ChatSquareText, Search, ArrowRight, Star } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-light">
      {/* Hero Section */}
      <div className="bg-danger text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-3">Welcome to KnightMarket</h1>
              <p className="lead mb-4">
                Your one-stop marketplace for Rutgers students to buy, sell, and connect with fellow Knights.
              </p>
              <Button 
                as={Link} 
                to="/marketplace" 
                variant="light" 
                size="lg" 
                className="d-inline-flex align-items-center gap-2 mx-2"
              >
                Explore Marketplace
                <ArrowRight />
              </Button>
              
              <Button 
                as={Link} 
                to="/forum" 
                variant="light" 
                size="lg" 
                className="d-inline-flex align-items-center gap-2 mx-2"
              >
                Explore Forums
                <ArrowRight />
              </Button>
            </Col>
            <Col md={6}>
              <img 
                src="/api/placeholder/600/400"
                alt="KnightMarket Preview"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">What We Offer</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="mb-3">
                  <Shop size={40} className="text-danger" />
                </div>
                <Card.Title className="mb-3">Buy & Sell</Card.Title>
                <Card.Text>
                  List and discover textbooks, electronics, furniture, and more. Direct transactions with fellow students mean better deals for everyone.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="mb-3">
                  <ChatSquareText size={40} className="text-danger" />
                </div>
                <Card.Title className="mb-3">Community Forum</Card.Title>
                <Card.Text>
                  Join discussions, ask questions, and share insights with the Rutgers community. Stay connected and informed.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="mb-3">
                  <Search size={40} className="text-danger" />
                </div>
                <Card.Title className="mb-3">Easy Search</Card.Title>
                <Card.Text>
                  Find exactly what you need with our powerful search and filter system. Browse by category, price, or location.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* How It Works Section */}
      <div className="bg-white py-5">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row className="justify-content-center">
            <Col md={8}>
              <div className="d-flex flex-column gap-4">
                {[
                  {
                    step: 1,
                    title: "Create an Account",
                    description: "Sign up using your Rutgers email to join our trusted community."
                  },
                  {
                    step: 2,
                    title: "Browse or Post",
                    description: "Look through listings or create your own to sell items."
                  },
                  {
                    step: 3,
                    title: "Connect and Transact",
                    description: "Message other users and arrange safe on-campus meetings."
                  }
                ].map((item) => (
                  <Card key={item.step} className="border-0 shadow-sm">
                    <Card.Body className="d-flex align-items-center gap-3">
                      <div className="bg-danger text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        {item.step}
                      </div>
                      <div>
                        <Card.Title className="mb-1">{item.title}</Card.Title>
                        <Card.Text className="mb-0 text-muted">
                          {item.description}
                        </Card.Text>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5">
        <Card className="bg-danger text-white text-center p-4 border-0">
          <Card.Body>
            <h3 className="mb-3">Ready to Get Started?</h3>
            <p className="mb-4">Join the KnightMarket community today and start exploring!</p>
            <Button 
              as={Link} 
              to="/marketplace" 
              variant="light" 
              size="lg"
              className="d-inline-flex align-items-center gap-2"
            >
              Start Exploring
              <ArrowRight />
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Home;