import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import LogoutButton from './Logout-btn';

function UserPage() {
    const { golfClubs, error,  } = useContext(AuthContext);

    return (
        <div>
            <h2>Användarsida</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h3>Golfklubbor</h3>
            <ul>
                {golfClubs.map(club => (
                    <li key={club._id}>
                        {club.brand} {club.model} - {club.price} kr
                    </li>
                ))}
            </ul>
            <LogoutButton/>
        </div>
    );
}

export default UserPage;
