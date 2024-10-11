import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/Context';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { login, error, setError } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        // setError(null); // Återställ felmeddelande

        try {
            await login(username, password);
            const storedUser = localStorage.getItem('user'); // Hämta sparad användardata

            if (storedUser) {
                const { role } = JSON.parse(storedUser); // Hämta rollen
                if (role === 'admin') {
                    navigate('/admin-page'); // Navigera till adminsidan om rollen är admin
                } else {
                    navigate('/user-page'); // Navigera till användarsidan annars
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Hantera navigering till registreringssidan
    function handleRegister() {
        navigate('/register');
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
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Logga in</button>
            </form>
            <button onClick={handleRegister}>Registrera dig</button> {/* Ny registreringsknapp */}
        </div>
    );
}

export default Login;
