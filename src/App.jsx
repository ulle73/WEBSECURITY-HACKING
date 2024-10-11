import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './context/Context';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';

function App() {
    const { user } = useContext(AuthContext) || {}; // Hämta användardata från kontexten
    const role = user?.role; // Hämta rollen på användaren
    console.log("Role:", role);

    // Om användaren redan är inloggad, omdirigera till användarsidan
    if (user) {
        return (
            <Routes>
                <Route path="/" element={<Navigate to={role === 'admin' ? '/admin-page' : '/user-page'} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user-page" element={<UserPage />} />
                {role === 'admin' && <Route path="/admin-page" element={<AdminPage />} />}
                {/* Om ingen matchning, omdirigera till inloggning */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Om ingen matchning, omdirigera till inloggning */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
