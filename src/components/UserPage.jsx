import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate } from 'react-router-dom';
import Layout from './Layout'; // Importera Layout-komponenten

function UserPage() {
    const { user, golfClubs } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/" />; // Omdirigera om inte inloggad
    }

    return (
        <Layout>
            <h2>Välkommen till användarsidan!</h2>
            <div className="golf-club-list">
                {golfClubs.map(club => (
                    <div className="golf-club-card" key={club._id}>
                        <h4>{club.brand} {club.model}</h4>
                        <p>{club.price} kr</p>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default UserPage;
