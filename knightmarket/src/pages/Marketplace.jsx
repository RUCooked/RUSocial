import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Image } from 'react-bootstrap';
import { PlusCircle, PersonCircle} from 'react-bootstrap-icons';
import { getAuthHeaders } from '../utils/getJWT';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [selectedListing, setSelectedListing] = useState(null); // Stores the selected listing details

  const fetchListings = async () => {
    const verifiedHeader = await getAuthHeaders();
    try {
      const response = await axios.get('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/marketplace', {
        headers: verifiedHeader,
      });

      const parsedBody = JSON.parse(response.data.body);

      const apiListings = parsedBody.map(post => ({
        id: post.postsId,
        title: post.title,
        description: post.product_description,
        images: post.images_url || [],
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

  const handleViewDetails = (listing) => {
    setSelectedListing(listing); // Set the selected listing
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide the modal
    setSelectedListing(null); // Clear the selected listing
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Marketplace</h2>
        <Button 
          as={Link} 
          to="/make-listing" 
          variant="success"
          className="d-flex align-items-center gap-2"
        >
          <PlusCircle size={20} />
          Add Listing
        </Button>
      </div>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {listings.map((listing) => (
            <Col key={listing.id}>
              <Card className="h-100 d-flex flex-column text-start">
                <Card.Img 
                  variant="top" 
                  src={listing.images[0] || '/placeholder.jpg'} // Show the first image or a placeholder
                  alt={listing.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title 
                    className="text-truncate" 
                    title={listing.title}
                  >
                    {listing.title}
                  </Card.Title>
                  <Card.Text 
                    className="text-truncate"
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={listing.description} // Tooltip shows full text on hover
                  >
                    {listing.description}
                  </Card.Text>
                  <Card.Text><strong>Price:</strong> ${listing.price}</Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={() => handleViewDetails(listing)} // Open modal with details
                    className="mt-auto"
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

      {/* Modal for Detailed View */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered
        size="lg" // Makes the modal wider
        fullscreen="md-down"
        >
        <Modal.Header closeButton>
          <Modal.Title>{selectedListing?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedListing && (
            <>
              <Image
                src={selectedListing.images[0] || '/placeholder.jpg'}
                alt={selectedListing.title}
                className="mb-3"
                style={{ width: '100%', height: '500px', objectFit: 'scale-down' }}
                rounded
              />
              <h5 className="text-muted">Description</h5>
              <p>{selectedListing.description}</p>
              <h5 className="text-muted">Price</h5>
              <p>${selectedListing.price}</p>
              <div className="d-flex align-items-center mb-3">
                <PersonCircle
                  size={50} // Set the size to match the original profile picture size
                  className="me-2" // Add some margin to the right for spacing
                  style={{ color: '#6c757d' }} // Optional: Adjust color to match your design
                />
                <div>
                  <p className="mb-0"><strong>User Name</strong></p> {/* Placeholder for user name */}
                  <Button variant="primary" size="sm">Message User</Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Marketplace;