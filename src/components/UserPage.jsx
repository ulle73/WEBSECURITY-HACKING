import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';
import LogoutButton from './Logout-btn';

function UserPage() {
    const {  error,  } = useContext(AuthContext);

    return (
        <div>
            <h2>Användarsida</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
       
            <LogoutButton/>
        </div>
    );
}

export default UserPage;
