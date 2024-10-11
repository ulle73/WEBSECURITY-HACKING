import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Skapa kontext
export const AuthContext = createContext();

// AuthProvider-komponenten
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

      // Återhämta användardata från localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // Ställ in loading på false efter att ha kontrollerat användardata
    }, []);

    // Logga in användare
    async function login(username, password) {
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password });
            const { role } = response.data; // Se till att detta är rätt och att backend returnerar detta
            console.log(response.data);
            
            // Spara användardata i kontexten
            const userData = { username, role }; // Lagra användardata
            setUser(userData);

            // Spara användardata i localStorage
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            console.error("Login failed", err);
            setError('Inloggning misslyckades. Kontrollera dina uppgifter.');
            throw err; // Kasta fel för att fånga det i Login-komponenten
        }
    }

 // Registrera ny användare och logga in automatiskt
async function register(username, password, role = 'user') {
    try {
        // Registrera användaren
        const response = await axios.post('http://localhost:5000/register', { username, password, role });
        setError(null);

        // Logga in automatiskt efter registrering
        await login(username, password); // Logga in med de registrerade uppgifterna
    } catch (error) {
        console.error("Registration failed", error);
        setError('Registrering misslyckades. Försök igen.');
        throw error;
    }
}


    // Logga ut användare
    function logout() {
        setUser(null);
        localStorage.removeItem('user')
    }





    // Kontrollera användartillstånd och hämta golfklubbor
    useEffect(() => {
        async function checkUser() {
            setLoading(false);
        }
        checkUser();
    }, []);

 

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}
