import React, { useContext, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './context/Context';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './screens/UserPage';
import AdminPage from './screens/AdminPage';
import backgroundImage from './assets/image.png';
import ClubDetails from './screens/ClubDetails';
import Logs from './screens/Logs';

function App() {
    const { user, logout, error, setError } = useContext(AuthContext) || {};
    const role = user?.role;

 

    return (
        <div className="container-fluid">
            <header style={{
                height: '15rem',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <h1 className="header-h1">Ryd's Golfshop</h1>
                {user && <button style={{ transform: 'scale(0.75)' }} className='button-71' onClick={logout}>Logout</button>}
            </header>

            <main>
                <Routes>
                    {user ? (
                        <>
                            <Route path="/" element={<Navigate to={role === 'admin' ? '/admin-page' : '/user-page'} />} />
                            <Route path="/user-page" element={<UserPage />} />
                            {role === 'admin' && <Route path="/admin-page" element={<AdminPage />} />}
                            {role === 'admin' && <Route path="/admin-logs" element={<Logs />} />}
                            <Route path="/club/:clubId" element={<ClubDetails />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                        </>
                    )}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            <footer>
                <p className='footer-text'>Ryd's Golfshop © 2024</p>
            </footer>
        </div>
    );
}

export default App;
