import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate } from 'react-router-dom';
import LogoutButton from './Logout-btn';
import axios from 'axios';

function AdminPage() {
    const { user, golfClubs, deleteGolfClub } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user || user.role !== 'admin') {
                setIsAdmin(false); // Användaren är inte admin, ingen serveranrop
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
                    setIsAdmin(true); // Användaren är admin, tillåt åtkomst
                }
            } catch (error) {
                setIsAdmin(false); // Servern avvisade förfrågan
            } finally {
                setLoading(false); // Avsluta loading state
            }
        };

        // Kontrollera användarroll
        if (user) {
            checkAdmin();
        } else {
            setLoading(false); // Om ingen användare är inloggad, ställ in loading till false
        }
    }, [user]);

    // Hantera rendering medan vi laddar
    if (loading) {
        return <div>Loading...</div>;
    }

    // Omdirigera om användaren inte är inloggad eller inte är admin
    if (!user || isAdmin === false) {
        return <Navigate to="/user-page" />;
    }

    // Om vi är här, är användaren admin
    return (
        <div>
            <h1>Admin-sidan</h1>
            <LogoutButton />
            <h3>Golfklubbar:</h3>
            <ul>
                {golfClubs.map(club => (
                    <li key={club._id}>
                        {club.brand} {club.model} - {club.price} kr
                        <button onClick={() => deleteGolfClub(club._id)}>
                            Ta bort
                        </button>
                    </li>
                ))}
            </ul>
            
        </div>
    );
}

export default AdminPage;
