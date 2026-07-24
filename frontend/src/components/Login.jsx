import { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/Login.css';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Bletchley Chat</h1>
                <h2>Iniciar Sesión</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="register-link">
                    ¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/register'; }}>Regístrate</a>
                </p>
            </div>
        </div>
    );
}

export default Login;