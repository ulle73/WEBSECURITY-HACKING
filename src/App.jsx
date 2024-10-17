import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './context/Context';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './screens/UserPage';
import AdminPage from './screens/AdminPage';
import backgroundImage from './assets/image.png'


function App() {
    const { user, logout } = useContext(AuthContext) || {};
    const role = user?.role;

    if (user) {
        return (
            <div  className="container-fluid">
                <header style={{ 
                height: '12rem', 
                backgroundImage: `url(${backgroundImage})`,  // Använd bilden här
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
               }}>
                    <h1 style={{
                        fontWeight: 800,
                        fontSize: '5rem',
                        color: 'transparent',             // Gör texten genomskinlig
                        WebkitTextStroke: '1px white',    // Skapar en svart ram runt texten
                        textAlign: 'center'               // Centrera texten horisontellt
                    }}>
                        Ryd's Golfshop
                    </h1>
                    <button onClick={logout}>Logout</button>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<Navigate to={role === 'admin' ? '/admin-page' : '/user-page'} />} />
                        <Route path="/user-page" element={<UserPage />} />
                        {role === 'admin' && <Route path="/admin-page" element={<AdminPage />} />}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>

                <footer>
                    <p>Ryd's Golfshop © 2024</p>
                </footer>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <header style={{
                height: '12rem',
                backgroundImage: `url(${backgroundImage})`,  // Använd bilden här
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <h1 style={{
                    fontWeight: 800,
                    fontSize: '5rem',
                    color: 'transparent',             // Gör texten genomskinlig
                    WebkitTextStroke: '1px white',    // Skapar en svart ram runt texten
                    textAlign: 'center'               // Centrera texten horisontellt
                }}>
                    Golf Webshop
                </h1>
               
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            <footer>
                <p>Golf Webshop © 2024</p>
            </footer>
        </div>
    );
}

export default App;
