// Login.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/Context';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, FloatingLabel } from 'react-bootstrap';

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
        <Container className="login-container" style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2 className="text-center mb-4">Logga in</h2>
            <Form onSubmit={handleSubmit}>
                <FloatingLabel controlId="floatingUsername" label="Användarnamn" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Användarnamn"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder=" "  // Tomt mellanrum för att aktivera :placeholder-shown
                    />
                </FloatingLabel>

                <FloatingLabel controlId="floatingPassword" label="Lösenord" className="mb-3">
                    <Form.Control
                        type="password"
                        placeholder="Lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder=" "  // Tomt mellanrum för att aktivera :placeholder-shown
                    />
                </FloatingLabel>

                <button variant="primary" type="submit" className="w-100">
                    Logga in
                </button>

                {error && <p className="text-danger mt-2">{error}</p>}
            </Form>
        </Container>
    );
}

export default Login;
