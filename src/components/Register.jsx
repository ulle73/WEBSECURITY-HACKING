import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/Context';
import { useNavigate } from 'react-router-dom';

function Register() {
    const { register, error, setError } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
       

        try {
            await register(username, password); // Registrera användare
            navigate('/user-page'); // Navigera till användarsidan efter lyckad registrering
        } catch (err) {
           console.log(err)
        }
    }

    return (
        <div>
            <h2>Registrera</h2>
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
                <button type="submit">Registrera</button>
            </form>
        </div>
    );
}

export default Register;
