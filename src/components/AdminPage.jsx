import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import LogoutButton from './Logout-btn';

function AdminPage() {
    const { user, golfClubs, deleteGolfClub, error } = useContext(AuthContext);

    return (
        <div>
            <h2>Admin Sida</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h3>Golfklubbor</h3>
            <ul>
                {golfClubs.map(club => (
                    <li key={club._id}>
                        {club.brand} {club.model} - {club.price} kr
                        <button onClick={() => deleteGolfClub(club._id)}>Radera</button>
                    </li>
                ))}
            </ul>
            <LogoutButton/>
        </div>
    );
}

export default AdminPage;
