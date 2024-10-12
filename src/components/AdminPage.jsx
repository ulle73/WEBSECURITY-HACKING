import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate } from 'react-router-dom';
import LogoutButton from './Logout-btn'

function AdminPage() {
    const { user } = useContext(AuthContext);

    // Kontrollera om användaren är inloggad och har rollen 'admin'
    if (!user || (user.token && user.role !== 'admin')) {
        return <Navigate to="/" />; // Omdirigera om inte inloggad eller ingen admin-roll
    }

    return (
        <div>
            <h1>Admin-sidan</h1>
            <LogoutButton />
        </div>
    );
}

export default AdminPage;
