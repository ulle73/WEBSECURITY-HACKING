// AdminPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate } from 'react-router-dom';
import LogoutButton from './Logout-btn';
import axios from 'axios';

function AdminPage() {
    const { user } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true); // Lägg till en loading state

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await axios.get('http://localhost:5000/admin-page', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                // Om förfrågan lyckas betyder det att användaren är admin
                if (response.status === 200) {
                    setIsAdmin(true);
                }
            } catch (error) {
                // Om förfrågan misslyckas, sätt isAdmin till false
                setIsAdmin(false);
            } finally {
                setLoading(false); // Ställ in loading till false oavsett resultat
            }
        };

        // Kontrollera om användaren är inloggad innan vi gör förfrågan
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
        return <Navigate to="/" />;
    }

    // Om vi är inne här, är användaren admin
    return (
        <div>
            <h1>Admin-sidan</h1>
            <LogoutButton />
        </div>
    );
}

export default AdminPage;
