import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function DirectMessages() {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          <h1 className="display-4">Hello World</h1>
          <p className="lead">This is a simple static page using React and Bootstrap.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default DirectMessages;