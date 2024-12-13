import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Carousel } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthorized = true; // Temporary authorization check

  const fetchListings = async () => {
    try {
      const response = await axios.get('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/marketplace', {
        headers: {
          'Content-Type': 'application/json',
          'credentials': `masterknight:chickenNugget452!` // Replace with secure credentials management
        }
      });
  
      console.log('API Response:', response.data);
  
      // Parse the body field, as it is a JSON string
      const parsedBody = JSON.parse(response.data.body);
  
      // Map over the parsed body to extract the listings
      const apiListings = parsedBody.map(post => ({
        id: post.postsId,
        title: post.title,
        description: post.product_description,
        images: post.images_url || [], // Array of S3 image URLs
        price: post.product_price,
        datePosted: post.date_posted,
        updatedAt: post.updated_at
      }));
  
      setListings(apiListings);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

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

      {/* Loading State */}
      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Listings Grid */}
      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {listings.map((listing) => (
            <Col key={listing.id}>
              <Card className="h-100">
                {listing.images.length > 0 ? (
                  <Carousel>
                    {listing.images.map((url, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={url}
                          alt={`Image ${index + 1}`}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <Card.Img 
                    variant="top" 
                    src="/placeholder.jpg" // Fallback placeholder image
                    alt="No image available"
                    className="object-fit-cover"
                    style={{ height: '200px' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{listing.title}</Card.Title>
                  <Card.Text>{listing.description}</Card.Text>
                  <Card.Text><strong>Price:</strong> ${listing.price}</Card.Text>
                  <Button 
                    variant="primary" 
                    as={Link} 
                    to={`/listing/${listing.id}`}
                    className="w-100"
                  >
                    View Details
                  </Button>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    Posted on {new Date(listing.datePosted).toLocaleDateString()}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Marketplace;