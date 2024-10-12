import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import LogoutButton from './Logout-btn';

function UserPage() {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Kontrollera om användaren är inloggad
    if (!user) {
        return <Navigate to="/" />; // Omdirigera till inloggning om användaren inte är inloggad
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user-page', {
                    headers: {
                        Authorization: `Bearer ${user.token}` // Skicka JWT-token för autentisering
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching user data", error);
                setError("Det gick inte att hämta användardata.");
            }
        };

        fetchData();
    }, [user]);

    if (!data) return <div>Laddar...</div>;

    return (
        <div>
            <h1>Användarsida</h1>
            <LogoutButton/>
           
           
        </div>
    );
}

export default UserPage;
