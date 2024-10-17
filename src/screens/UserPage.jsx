import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate, Link } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';


function UserPage() {
    const { user, golfClubs } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/" />;
    }
    

    return (
        <div className="container text-center">
            <h1 className="mb-4">Användar-sida</h1>
            <Row className="justify-content-center">
                {golfClubs.map(club => (
                    <Col key={club._id} xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
                        <Card style={{ height: '100%', textAlign: 'center', border: '1px solid #ccc' }}>
                            <Card.Img
                                style={{ height: '18rem', objectFit: 'cover' }}
                                variant="top"
                                src={club.imgUrl}
                                alt={`${club.brand} ${club.model}`}
                            />
                            <Link to={`/club/${club._id}`} style={{ textDecoration: 'none' }}>
                                <Card.Body>
                                    <Card.Title>{club.brand} {club.model}</Card.Title>
                                    <Card.Text>Pris: {club.price} kr</Card.Text>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default UserPage;
