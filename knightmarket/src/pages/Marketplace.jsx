import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Image, Offcanvas, Form } from 'react-bootstrap';
import { PlusCircle, PersonCircle, Funnel } from 'react-bootstrap-icons';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]); // State for filtered listings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [showOffcanvas, setShowOffcanvas] = useState(false); // Controls offcanvas visibility
  const [selectedListing, setSelectedListing] = useState(null); // Stores the selected listing details

  // State for price range filters
  const [priceRange, setPriceRange] = useState({
    minPrice: '',
    maxPrice: ''
  });

  // Fetch Listings
  const fetchListings = async () => {
    try {
      const response = await axios.get('https://r0s9cmfju1.execute-api.us-east-2.amazonaws.com/cognito-testing/marketplace', {
        headers: {
          'Content-Type': 'application/json',
          'credentials': `masterknight:chickenNugget452!` // Replace with secure credentials management
        }
      });

      const parsedBody = JSON.parse(response.data.body);

      const apiListings = parsedBody.map(post => ({
        id: post.postsId,
        title: post.title,
        description: post.product_description,
        images: post.images_url || [],
        price: parseFloat(post.product_price), // Ensure the price is a number
        datePosted: post.date_posted,
        updatedAt: post.updated_at
      }));

      setListings(apiListings);
      setFilteredListings(apiListings); // Initially, show all listings
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

  const handleShowOffcanvas = () => setShowOffcanvas(true);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  // Handle price range change with formatting
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Format price fields
    const numericValue = value.replace(/[^0-9.]/g, ''); // Strip everything except numbers and '.'
    const formattedValue = numericValue.match(/^\d*(\.\d{0,2})?$/) // Match up to 2 decimal places
      ? `$${numericValue}`
      : priceRange[name]; // Keep the previous valid value if invalid input

    setPriceRange((prev) => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Apply price range filters
  const applyFilters = () => {
    const min = parseFloat(priceRange.minPrice.replace(/[^0-9.]/g, '')) || 0; // Parse the min price or default to 0
    const max = parseFloat(priceRange.maxPrice.replace(/[^0-9.]/g, '')) || Infinity; // Parse the max price or default to Infinity

    const filtered = listings.filter((listing) => listing.price >= min && listing.price <= max);

    setFilteredListings(filtered); // Update the displayed listings with the filtered results
    setShowOffcanvas(false); // Close the filters offcanvas
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Marketplace</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            className="d-flex align-items-center gap-2"
            onClick={handleShowOffcanvas}
          >
            <Funnel size={20} />
            Filters
          </Button>
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
          {filteredListings.map((listing) => (
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
                  <Card.Text><strong>Price:</strong> ${listing.price.toFixed(2)}</Card.Text>
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

      {/* Offcanvas for Filters */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group className="mb-3" controlId="priceRangeMin">
              <Form.Label>Min Price</Form.Label>
              <Form.Control
                type="text"
                name="minPrice"
                value={priceRange.minPrice}
                onChange={handleFilterChange}
                placeholder="Enter minimum price"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="priceRangeMax">
              <Form.Label>Max Price</Form.Label>
              <Form.Control
                type="text"
                name="maxPrice"
                value={priceRange.maxPrice}
                onChange={handleFilterChange}
                placeholder="Enter maximum price"
              />
            </Form.Group>
            <Button variant="primary" className="w-100 mt-3" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="secondary"
              className="w-100 mt-2"
              onClick={() => {
                setPriceRange({ minPrice: '', maxPrice: '' }); // Reset price range
                setFilteredListings(listings); // Reset filtered listings
                setShowOffcanvas(false); // Close the offcanvas
              }}
            >
              Remove All Filters
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}

export default Marketplace;