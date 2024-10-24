import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate, Link } from 'react-router-dom';
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
                    withCredentials: true,  // Skicka cookies automatiskt
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
        <div className="container text-center">
            <h1 className="mb-4">Admin-sidan</h1>
            <Link to="/admin-logs">Logs</Link>
          
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
                                    <Card.Text>
                                        Pris: {club.price} kr
                                    </Card.Text>
                                </Card.Body>
                            </Link>
                                    <Button style={{width: '30%', alignSelf: 'center', marginBottom: '5px'}} variant="danger" onClick={() => deleteGolfClub(club._id)}>
                                        Ta bort
                                    </Button>
                                
                           
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default AdminPage;
