// Context.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from "jwt-decode";
// import dotenv from "dotenv"

// Skapa kontext
export const AuthContext = createContext();
// dotenv.config();

// AuthProvider-komponenten
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [golfClubs, setGolfClubs] = useState([]);

    // Återhämta användardata från cookies
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user-page', { withCredentials: true });
                const { user } = response.data; // Nu returneras användardata
                if (user) {
                    setUser(user); // Sätt användarens data i state
                }
            } catch (err) {
                console.error("Failed to retrieve user from cookies", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Logga in användare
    async function login(username, password) {
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password }, { withCredentials: true });
            const { role } = response.data;

            const userData = { username, role };
            setUser(userData);

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
            await login(username, password); // Automatisk inloggning efter registrering
        } catch (error) {
            console.error("Registration failed", error);
            setError('Registrering misslyckades. Försök igen.');
            throw error;
        }
    }

    // Logga ut användare
    async function logout() {
        try {
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
            setError('Misslyckades med att logga ut.');
        }
    }

    // Hämta golfklubbor
    async function fetchGolfClubs() {
        try {
            const response = await axios.get('http://localhost:5000/user-page', { withCredentials: true });
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
            await axios.delete(`http://localhost:5000/admin-page/delete/${id}`, { withCredentials: true });
            setGolfClubs(golfClubs.filter(club => club._id !== id));  // Uppdatera state
        } catch (err) {
            console.error("Error deleting golf club", err);
            setError('Misslyckades med att radera golfklubben. Försök igen.');
        }
    }

    // Skicka recension
    const handleReviewSubmit = async (clubId, { review, rating }) => {
        try {
            await axios.post(`http://localhost:5000/clubs/${clubId}/review`, { review, rating }, { withCredentials: true });

            // Hämta uppdaterade golfklubbar efter inskickning
            await fetchGolfClubs();  // Anropar funktionen för att hämta de senaste golfklubbarna
        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

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
        <AuthContext.Provider value={{ user, login, register, logout, loading, error, golfClubs, fetchGolfClubs, deleteGolfClub, handleReviewSubmit }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}
