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
        <div>
            <h2>Logga in</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Användarnamn:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Lösenord:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Logga in</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default Login;
