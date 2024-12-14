import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { Container, Card } from 'react-bootstrap';

function Login() {
  const navigate = useNavigate();

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Authenticator>
            {({ user }) => {
              navigate(-1);
              return null;
            }}
          </Authenticator>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;