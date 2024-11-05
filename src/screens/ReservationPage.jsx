// Reservations.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/Context';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';

function Reservations() {
  const { user, golfClubs, fetchReservations, reservations } = useContext(AuthContext);
  const [totalPrice, setTotalPrice] = useState(0);

  if (!user) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    console.log('User in Reservations:', user);
    fetchReservations();
  }, [user]);

  useEffect(() => {
    // Beräkna totalpriset varje gång reservationer ändras
    const total = reservations.reduce((acc, reservation) => {
      const club = golfClubs.find(club => club._id === reservation.clubId);
      return acc + (club ? club.price : 0);
    }, 0);
    setTotalPrice(total);
  }, [reservations, golfClubs]);

  // Gruppera reservationer baserat på clubId
  const groupedReservations = reservations.reduce((acc, reservation) => {
    const club = golfClubs.find(club => club._id === reservation.clubId);
    if (club) {
      const existing = acc.find(item => item.clubId === club._id);
      if (existing) {
        existing.quantity += 1; // Öka quantity om klubban redan finns
      } else {
        acc.push({
          clubId: club._id,
          brand: club.brand,
          model: club.model,
          price: club.price,
          image: reservation.image,
          quantity: 1 // Sätt quantity till 1 för ny klubb
        });
      }
    }
    return acc;
  }, []);

  return (
    <div style={{ marginTop: '-70px' }}>
      <h2 className="text-center mt-5">Mina Reservationer</h2>
      <Container className="reservations-container mt-5" style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <Row>
          {groupedReservations.length > 0 ? (
            groupedReservations.map(reservation => (
              <Col key={reservation.clubId} xs={12} className="mb-3">
                <Card style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                      src={reservation.image || 'default-image-url.png'} // Ange en standardbild om ingen bild finns
                      alt={`${reservation.brand} ${reservation.model}`}
                      fluid
                      style={{ width: '80px', height: 'auto', borderRadius: '5px', marginRight: '15px' }}
                    />
                    <div>
                      <strong>{reservation.brand} {reservation.model}</strong><br />
                      <small>Antal: {reservation.quantity}</small><br />
                    </div>
                  </div>
                  <div style={{ alignSelf: 'center', marginLeft: 'auto' }}>
                    <strong>{reservation.price * reservation.quantity} kr</strong> {/* Beräkna pris baserat på quantity */}
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center">Inga reservationer funna.</div>
            </Col>
          )}
        </Row>
        {groupedReservations.length > 0 && (
          <Row className="mt-3">
            <Col xs={12} style={{ textAlign: 'right' }}>
              <h5>Totalt: {totalPrice} kr</h5>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default Reservations;
