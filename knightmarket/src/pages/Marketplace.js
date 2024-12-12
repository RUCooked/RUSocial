import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';

function Marketplace() {
  const [listings, setListings] = useState([
    {
      id: 1,
      title: 'Item 1',
      description: 'This is a description for item 1.',
      image: '/api/placeholder/150/150'
    },
    {
      id: 2,
      title: 'Item 2',
      description: 'This is a description for item 2.',
      image: '/api/placeholder/150/150'
    },
    {
      id: 3,
      title: 'Item 3',
      description: 'This is a description for item 3.',
      image: '/api/placeholder/150/150'
    }
  ]);

  const isAuthorized = true; // Temporary authorization check

  const addListing = (newListing) => {
    setListings([...listings, { ...newListing, id: listings.length + 1 }]);
  };

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Marketplace</h2>
        {isAuthorized && (
          <Button 
            as={Link} 
            to="/make-listing" 
            variant="success"
            className="d-flex align-items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Listing
          </Button>
        )}
      </div>

      {/* Listings Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {listings.map((listing) => (
          <Col key={listing.id}>
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={listing.image} 
                alt={listing.title}
                className="object-fit-cover"
                style={{ height: '200px' }}
              />
              <Card.Body>
                <Card.Title>{listing.title}</Card.Title>
                <Card.Text>{listing.description}</Card.Text>
                <Button 
                  variant="primary" 
                  as={Link} 
                  to={`/listing/${listing.id}`}
                  className="w-100"
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Marketplace;