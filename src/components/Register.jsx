import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/Context';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, FloatingLabel } from 'react-bootstrap';

function Register() {
    const { register, error } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await register(username, password);
            navigate('/user-page');
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <Container className="login-container" style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2 className="text-center mb-4">Registrering</h2>
            <Form onSubmit={handleSubmit}>
                <FloatingLabel controlId="floatingUsername" label="Användarnamn" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Användarnamn"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required

                    />
                </FloatingLabel>

                <FloatingLabel controlId="floatingPassword" label="Lösenord" className="mb-3">
                    <Form.Control
                        type="password"
                        placeholder="Lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required

                    />
                </FloatingLabel>

                <button variant="primary" type="submit" className="w-100 button-71">
                    Registrera dig
                </button>

                {error && <p className="text-danger mt-2">{error}</p>}
            </Form>
            <a href="/">Tillbaka till login</a>
        </Container>
    );
}

export default Register;
