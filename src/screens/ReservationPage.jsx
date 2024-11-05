// Reservations.jsx
import React, { useContext, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/Context';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';

function Reservations() {
  const { user, golfClubs, fetchReservations, reservations } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    console.log('User in Reservations:', user);
    fetchReservations();
  }, [user]);

  return (
    <div style={{ marginTop: '-70px' }}>
      <h2 className="text-center mt-4">Mina Reservationer</h2>
      <Container className="reservations-container mt-5" style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '20px' }}>
        <Row>
          {reservations.length > 0 ? (
            reservations.map(reservation => {
              const club = golfClubs.find(club => club._id === reservation.clubId);
              return (
                <Col key={reservation._id} xs={12} md={6} className="mb-4">
                  <Card style={{ width: '100%', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <Row noGutters>
                      <Col xs={4}>
                        <Image
                          src={club?.image || 'default-image-url.png'} // Ange en standardbild om ingen bild finns
                          alt={`${club?.brand} ${club?.model}`}
                          fluid
                          style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px', height: '100%', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col xs={8}>
                        <Card.Body>
                          <Card.Title>{club?.brand} {club?.model}</Card.Title>
                          <Card.Text>
                            <strong>Datum:</strong> {new Date(reservation.reservedAt).toLocaleDateString()}<br />
                            <strong>Tid:</strong> {new Date(reservation.reservedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Card.Text>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col xs={12}>
              <div className="text-center">Inga reservationer funna.</div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}

export default Reservations;
