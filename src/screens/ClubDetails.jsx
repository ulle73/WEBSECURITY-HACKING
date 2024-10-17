// ClubDetails.jsx
import React, { useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/Context';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';

function ClubDetails() {
  const { user, golfClubs } = useContext(AuthContext);
  const { clubId } = useParams();

  if (!user) {
    return <Navigate to="/" />;
  }

  // Hitta rätt golfklubba baserat på clubId
  const club = golfClubs.find(c => c._id === clubId);

  if (!club) {
    return <div>Golfklubba hittades inte</div>;
  }

  return (
    <div style={{ marginTop: '-70px' }}>
    <Container className="club-details-container mt-5" style={{ border: '1px solid #ccc' }}>
      <Row>
        <Col xs={12} md={6}>
          {/* Visar en stor bild av klubban */}
          <Image
            src={club.imgUrl}
            alt={`${club.brand} ${club.model}`}
            fluid
            style={{ width: '100%', objectFit: 'contain', maxHeight: '600px' }}
          />
        </Col>
        <Col xs={12} md={6}>
          <div className="club-info">
            <h2>{club.brand} {club.model}</h2>
            <p><strong>Pris:</strong> {club.price} kr</p>
            <p><strong>Beskrivning:</strong> {club.description}</p>
            <div><Button variant="primary" className="mt-3">
              Lägg till i varukorgen
            </Button></div>
            
          </div>
        </Col>
      </Row>
    </Container>
    </div>
  );
}

export default ClubDetails;
