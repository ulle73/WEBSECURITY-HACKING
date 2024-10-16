import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function AdminPage() {
    const { user, golfClubs, deleteGolfClub } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user || user.role !== 'admin') {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/admin-page', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (response.status === 200) {
                    setIsAdmin(true);
                }
            } catch (error) {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            checkAdmin();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || isAdmin === false) {
        return <Navigate to="/user-page" />;
    }

    return (
        <div className="container">
            <h1 className="text-center">Admin-sidan</h1>
            <Row>
                {golfClubs.map(club => (
                    <Col key={club._id} xs={12} md={6} lg={4} className="d-flex justify-content-center mb-4"> {/* Centrera korten */}
                        <Card style={{ width: '18rem', height: '18rem', marginBottom: '10rem', textAlign: 'center' }}> {/* Centrera texten */}
                            <Card.Img
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Justera bildens storlek och proportioner
                                variant="top"
                                src={club.imgUrl}
                                alt={`${club.brand} ${club.model}`}
                            />
                            <Card.Body>
                                <Card.Title>{club.brand} {club.model}</Card.Title>
                                <Card.Text>
                                    Pris: {club.price} kr
                                </Card.Text>
                                <Button variant="danger" onClick={() => deleteGolfClub(club._id)}>
                                    Ta bort
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default AdminPage;
