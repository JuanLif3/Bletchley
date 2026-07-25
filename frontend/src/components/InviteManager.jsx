import { useState, useEffect } from 'react';
import { inviteAPI } from '../services/api';
import '../styles/InviteManager.css';

function InviteManager() {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newLink, setNewLink] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadInvites();
    }, []);

    const loadInvites = async () => {
        try {
            setLoading(true);
            const response = await inviteAPI.getMyInvites();
            setInvites(response.data.data);
        } catch (err) {
            console.error('Error al cargar invitaciones:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateInvite = async () => {
        try {
            setGenerating(true);
            const response = await inviteAPI.createInvite();
            const invite = response.data.data;
            setNewLink(invite.link);
            await loadInvites();
        } catch (err) {
            console.error('Error al generar invitación:', err);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="invite-manager">
            <div className="invite-header">
                <h3>Invitar a alguien</h3>
                <p className="invite-subtitle">
                    Genera un link para que otro usuario pueda agregarte como contacto
                </p>
            </div>

            {/* Generar nuevo link */}
            <div className="invite-generate">
                <button
                    className="invite-generate-btn"
                    onClick={generateInvite}
                    disabled={generating}
                >
                    {generating ? 'Generando...' : 'Generar link de invitación'}
                </button>

                {newLink && (
                    <div className="invite-link-container">
                        <div className="invite-link">
                            <span>{newLink}</span>
                        </div>
                        <button
                            className="invite-copy-btn"
                            onClick={() => copyToClipboard(newLink)}
                        >
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>
                )}
            </div>

            {/* Lista de invitaciones */}
            <div className="invite-list">
                <h4>Mis invitaciones</h4>
                {loading ? (
                    <p className="invite-loading">Cargando...</p>
                ) : invites.length === 0 ? (
                    <p className="invite-empty">No tienes invitaciones generadas</p>
                ) : (
                    invites.map((invite) => (
                        <div key={invite.id} className="invite-item">
                            <div className="invite-item-info">
                <span className="invite-item-token">
                  {invite.token.substring(0, 12)}...
                </span>
                                <span className={`invite-item-status ${invite.used ? 'used' : 'pending'}`}>
                  {invite.used ? '✓ Usado' : 'Pendiente'}
                </span>
                            </div>
                            <div className="invite-item-date">
                                Expira: {formatDate(invite.expiresAt)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default InviteManager;