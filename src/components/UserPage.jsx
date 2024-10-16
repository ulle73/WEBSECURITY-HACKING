import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import LogoutButton from './Logout-btn';

function UserPage() {
    const { user, golfClubs, error } = useContext(AuthContext);
   
console.log(golfClubs);
    // Kontrollera om användaren är inloggad
    if (!user) {
        return <Navigate to="/" />; // Omdirigera till inloggning om användaren inte är inloggad
    }

  

    return (
        <div>
            <h1>Användarsida</h1>
            <LogoutButton/>
           
    
            <h3>Golfklubbor</h3>
            <ul>
                {golfClubs.map(club => (
                    <li key={club._id}>
                        {club.brand} {club.model} - {club.price} kr
                    </li>
                ))}
            </ul>
           
        </div>
    );
}

export default UserPage;
