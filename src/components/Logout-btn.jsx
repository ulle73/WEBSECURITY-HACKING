import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';

function LogoutButton() {
    const { logout } = useContext(AuthContext); 

    return (
        <button onClick={() => logout()}> 
            Logga ut
        </button>
    );
}

export default LogoutButton;
