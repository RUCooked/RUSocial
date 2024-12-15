import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Image, Offcanvas, Form } from 'react-bootstrap';
import { PlusCircle, PersonCircle, Funnel } from 'react-bootstrap-icons';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]); // State for filtered listings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [showOffcanvas, setShowOffcanvas] = useState(false); // Controls offcanvas visibility
  const [selectedListing, setSelectedListing] = useState(null); // Stores the selected listing details
  const [startDate, setStartDate] = useState(null); // Start date for filtering
  const [endDate, setEndDate] = useState(null);

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

    const numericValue = value.replace(/[^0-9.]/g, ''); // Strip everything except numbers and '.'
    const formattedValue = numericValue.match(/^\d*(\.\d{0,2})?$/) // Match up to 2 decimal places
      ? `$${numericValue}`
      : priceRange[name]; // Keep the previous valid value if invalid input

    setPriceRange((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  // Apply price range filters
  const applyFilters = () => {
    const minPrice = parseFloat(priceRange.minPrice.replace(/[^0-9.]/g, '')) || 0; // Parse the min price or default to 0
    const maxPrice = parseFloat(priceRange.maxPrice.replace(/[^0-9.]/g, '')) || Infinity; // Parse the max price or default to Infinity

    const filteredByPrice = listings.filter(
      (listing) => listing.price >= minPrice && listing.price <= maxPrice
    );

    const filteredByDate = filteredByPrice.filter((listing) => {
      const listingDate = new Date(listing.datePosted);
      const isAfterStartDate = startDate ? listingDate >= startDate : true;
      const isBeforeEndDate = endDate ? listingDate <= endDate : true;
      return isAfterStartDate && isBeforeEndDate;
    });

    setFilteredListings(filteredByDate); // Update the displayed listings with the filtered results
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
        <>
          {filteredListings.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {filteredListings.map((listing) => (
                <Col key={listing.id}>
                  <Card className="h-100 d-flex flex-column text-start">
                    {listing.images[0] ? (
                      <Card.Img
                        variant="top"
                        src={listing.images[0]}
                        alt={listing.title}
                        style={{
                          height: '380px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '380px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f0f0f0', 
                          color: '#7a7a7a',
                          fontSize: '16px',
                          textAlign: 'center',
                        }}
                      >
                        No image provided for listing
                      </div>
                    )}
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
                        title={listing.description}
                      >
                        {listing.description}
                      </Card.Text>
                      <Card.Text>
                        <strong>Price:</strong> ${listing.price.toFixed(2)}
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => handleViewDetails(listing)}
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
          ) : (
            <div className="text-center mt-4">
              <h5>No listings match your selected filters</h5>
            </div>
          )}
        </>
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
      
      {/* Offcanvas for Filters */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start">
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
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Select start date"
                  className="form-control mt-2"
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <div>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="Select end date"
                  className="form-control mt-2"
                />
              </div>
            </Form.Group>
            <Button variant="primary" className="w-100 mt-3" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="secondary"
              className="w-100 mt-2"
              onClick={() => {
                setPriceRange({ minPrice: '', maxPrice: '' });
                setStartDate(null);
                setEndDate(null);
                setFilteredListings(listings);
                setShowOffcanvas(false);
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