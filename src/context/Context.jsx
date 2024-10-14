// Context.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from "jwt-decode";

// Skapa kontext
export const AuthContext = createContext();

// AuthProvider-komponenten
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [golfClubs, setGolfClubs] = useState([]);

    // Återhämta användardata från localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Logga in användare
    async function login(username, password) {
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password });
            const { token } = response.data;
            const decodedToken = jwtDecode(token);

            const userData = { username: decodedToken.username, role: decodedToken.role, token };
            setUser(userData);

            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            console.error("Login failed", err);
            setError('Inloggning misslyckades. Kontrollera dina uppgifter.');
            throw err;
        }
    }

    // Registrera ny användare
    async function register(username, password, role = 'user') {
        try {
            await axios.post('http://localhost:5000/register', { username, password, role });
            await login(username, password);
        } catch (error) {
            console.error("Registration failed", error);
            setError('Registrering misslyckades. Försök igen.');
            throw error;
        }
    }

    // Logga ut användare
    function logout() {
        setUser(null);
        localStorage.removeItem('user');
    }
    
    
    // Hämta golfklubbor
    async function fetchGolfClubs() {
        try {
            const token = user?.token; // Hämta token från användardata
            const response = await axios.get('http://localhost:5000/user-page', {
                headers: {
                    Authorization: `Bearer ${token}` // Skicka tokenen i Authorization-headern
                }
            });
            console.log(response)
            setGolfClubs(response.data.clubs);
            setError(null);
        } catch (err) {
            console.error("Error fetching golf clubs", err);
            setError('Misslyckades med att hämta golfklubbor. Försök igen.');
        }
    }
    
    // Ta bort golfklubb
    async function deleteGolfClub(id) {
        try {
            const token = user?.token;  // Hämta token från användaren
            await axios.delete(`http://localhost:5000/admin-page/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Skicka med token i Authorization-headern
                }
            });
            setGolfClubs(golfClubs.filter(club => club._id !== id));  // Uppdatera state
        } catch (err) {
            console.error("Error deleting golf club", err);
            setError('Misslyckades med att radera golfklubben. Försök igen.');
        }
    }
    
    // Kontrollera användartillstånd och hämta golfklubbor
    useEffect(() => {
        async function checkUser() {
            setLoading(false);
        }
        checkUser();
    }, []);
    
    useEffect(() => {
        if (user) {
            fetchGolfClubs();
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error, golfClubs, fetchGolfClubs, deleteGolfClub }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}
