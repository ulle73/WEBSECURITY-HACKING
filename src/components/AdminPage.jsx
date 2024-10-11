import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import LogoutButton from './Logout-btn';

function AdminPage() {
    const { user, error } = useContext(AuthContext);

    return (
        <div>
            <h2>Admin Sida</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
           
            <LogoutButton/>
        </div>
    );
}

export default AdminPage;
