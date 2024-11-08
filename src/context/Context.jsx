import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Skapa kontext
export const AuthContext = createContext();

// AuthProvider-komponenten
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [golfClubs, setGolfClubs] = useState([]);
    const [reservations, setReservations] = useState([])
    const [cartItemCount, setCartItemCount] = useState(0)


    // Återhämta användardata från cookies
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-page`, { withCredentials: true });
                const { user } = response.data;
                console.log("User fetched after page reload:", user); // Logga användaren efter reload
                if (user) {
                    setUser(user);
                    setError(null);
                } else {
                    setUser(null); // Om ingen användare finns, sätt till null
                }
            } catch (err) {
                console.log("Error fetching user after page reload:", err); // Logga eventuella fel
                setUser(null);
                setError('Misslyckades med att hämta användardata.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);




    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Gör en begäran för att kontrollera autentisering
                await axios.get(`${import.meta.env.VITE_API_URL}/check-auth`, { withCredentials: true });
            } catch (error) {
                if (error.response?.status === 401) {
                    // Om användaren inte är autentiserad, logga ut
                    logout();
                }
            }
        };

        // Kör checkAuthStatus varje minut (60000 ms)
        const intervalId = setInterval(checkAuthStatus, 60000);

        // Rensa intervallet när komponenten demonteras
        return () => clearInterval(intervalId);
    }, []);  // Ingen beroende på `user`, kör bara en gång när komponenten mountas


    useEffect(() => {
        let inactivityTimer;

    
        if (user) {
       
            const resetTimer = () => {
                clearTimeout(inactivityTimer);
                inactivityTimer = setTimeout(() => {
                    logout();
                }, 2 * 60 * 1000); 
            };

            
            window.addEventListener('mousemove', resetTimer);
            window.addEventListener('keypress', resetTimer);
            window.addEventListener('click', resetTimer);

           
            resetTimer();

            // Rensa timers och event listeners när komponenten avmonteras eller användaren loggar ut
            return () => {
                clearTimeout(inactivityTimer); 
                window.removeEventListener('mousemove', resetTimer);
                window.removeEventListener('keypress', resetTimer);
                window.removeEventListener('click', resetTimer);
            };
        }
    }, [logout, user]); 
 



    // Logga in användare
    async function login(username, password, id) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { username, password }, { withCredentials: true });
            const { role } = response.data;
            const { id } = response.data

            console.log(response.data);
            await fetchReservations()
            const userData = { username, role, id };
            setUser(userData);
            setError(null);

        } catch (err) {
            setError(err.response?.data.message || 'Inloggning misslyckades. Kontrollera dina uppgifter.'); // Använd felmeddelande från backend
            throw err;
        }
    }

    // Registrera ny användare
    async function register(username, password) {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/register`, { username, password });
            await login(username, password); // Automatisk inloggning efter registrering
            setError(null);
        } catch (error) {
            setError(error.response?.data || 'Registrering misslyckades. Försök igen.'); // Använd felmeddelande från backend
            throw error;
        }
    }

    // Logga ut användare
    async function logout() {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, { withCredentials: true });
            setUser(null);
            setError(null);

        } catch (error) {
            setError(error.response?.data || 'Misslyckades med att logga ut.'); // Använd felmeddelande från backend
        }
    }

    // Hämta golfklubbor
    async function fetchGolfClubs() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-page`, { withCredentials: true });
            setGolfClubs(response.data.clubs);
            setError(null);
        } catch (err) {
            setError(err.response?.data || 'Misslyckades med att hämta golfklubbor. Försök igen.'); // Använd felmeddelande från backend
        }
    }

    // Ta bort golfklubb
    async function deleteGolfClub(id) {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin-page/delete/${id}`, { withCredentials: true });
            setGolfClubs(golfClubs.filter(club => club._id !== id));  // Uppdatera state
        } catch (err) {
            setError(err.response?.data.message || 'Misslyckades med att radera golfklubben. Försök igen.'); // Använd felmeddelande från backend
        }
    }

    // Skicka recension
    const handleReviewSubmit = async (clubId, { review, rating }) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/clubs/${clubId}/review`, { review, rating }, { withCredentials: true });
            await fetchGolfClubs();  // Hämta uppdaterade golfklubbar efter inskickning
        } catch (error) {
            setError(error.response?.data.message || 'Misslyckades med att skicka recensionen.'); // Använd felmeddelande från backend
        }
    };
    
    // Hämta reservationer
    async function fetchReservations() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/reservations`, { withCredentials: true });
            setReservations(response.data.reservations);
           
            console.log("Fetched Reservations:", response.data.reservations); // Logga det direkt
            setError(null);
        } catch (err) {
            setError(err.response?.data || 'Misslyckades med att hämta golfklubbor. Försök igen.'); // Använd felmeddelande från backend
        }
    }

    // Nytt useEffect för att logga när reservations ändras
    useEffect(() => {
        console.log("STATE RESERVATIONS:", reservations);
    }, [reservations]);


    // Kontrollera användartillstånd och hämta golfklubbor
    useEffect(() => {
        async function checkUser() {
            setLoading(false);
            setError(null);
        }
        checkUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchGolfClubs();
            setError(null);
        }
    }, [user]);


    useEffect(() => {
        setCartItemCount(reservations.length); // Uppdaterar kundvagnsräknaren baserat på reservationer
    }, [reservations]);



    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error, setError, golfClubs, fetchGolfClubs, deleteGolfClub, handleReviewSubmit, fetchReservations, reservations, cartItemCount }}>
            {loading ? <div>Loading...</div> : children}

        </AuthContext.Provider>
    );
}
