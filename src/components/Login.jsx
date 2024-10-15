// Login.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/Context';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { login, error } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await login(username, password);
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                const { role } = JSON.parse(storedUser);
                if (role === 'admin') {
                    navigate('/admin-page');
                } else {
                    navigate('/user-page');
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="login-container">
            <h2>Logga in</h2>
            <div className="form-wrapper">
            <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder=" "  // Tomt mellanrum för att aktivera :placeholder-shown
                    />
                    <label className={username ? 'filled' : ''}>Användarnamn</label>
                </div>
                <div className="input-wrapper">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder=" "  // Tomt mellanrum för att aktivera :placeholder-shown
                    />
                    <label className={password ? 'filled' : ''}>Lösenord</label>
                </div>
                <button type="submit">Logga in</button>
                {error && <p>{error}</p>}
            </form>
            </div>
        </div>

    );
}

export default Login;
