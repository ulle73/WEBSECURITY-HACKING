import React, { useContext } from 'react';
import { AuthContext } from '../context/Context';

function LogoutButton() {
    const { logout } = useContext(AuthContext); // Hämta logout-funktionen från kontexten

    return (
        <button onClick={() => logout()}> {/* Använd arrow-funktion här */}
            Logga ut
        </button>
    );
}

export default LogoutButton;
