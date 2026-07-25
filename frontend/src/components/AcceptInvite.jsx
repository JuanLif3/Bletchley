import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inviteAPI } from '../services/api';
import '../styles/AcceptInvite.css';

function AcceptInvite() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const acceptInvite = async () => {
            try {
                const response = await inviteAPI.acceptInvite(token);
                setSuccess(true);
                setLoading(false);

                // Redirigir al chat después de 3 segundos
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (err) {
                setError(err.response?.data?.error || 'Error al aceptar la invitación');
                setLoading(false);
            }
        };

        acceptInvite();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="accept-invite-container">
                <div className="accept-invite-card">
                    <div className="loading-spinner"></div>
                    <p>Aceptando invitación...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="accept-invite-container">
                <div className="accept-invite-card error">
                    <div className="icon">⚠️</div>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
            </div>
        );
    }

    return (
        <div className="accept-invite-container">
            <div className="accept-invite-card success">
                <h2>¡Invitación aceptada!</h2>
                <p>Ahora puedes chatear con tu nuevo contacto</p>
                <p className="redirecting">Redirigiendo...</p>
            </div>
        </div>
    );
}

export default AcceptInvite;