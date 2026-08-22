import { useState, useEffect } from 'react';
import { inviteAPI, userAPI } from '../services/api';
import '../styles/ProfileMenu.css';

function ProfileMenu({ user, onLogout, onProfileUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

    // Datos del perfil
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados de invitación
    const [invites, setInvites] = useState([]);
    const [newLink, setNewLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loadingInvites, setLoadingInvites] = useState(false);

    // Estados de feedback
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [loading, setLoading] = useState(false);

    // Cargar invitaciones al abrir
    useEffect(() => {
        if (isOpen) {
            loadInvites();
        }
    }, [isOpen]);

    const loadInvites = async () => {
        try {
            setLoadingInvites(true);
            const response = await inviteAPI.getMyInvites();
            setInvites(response.data.data);
        } catch (err) {
            console.error('Error al cargar invitaciones:', err);
        } finally {
            setLoadingInvites(false);
        }
    };

    // Generar invitación
    const generateInvite = async () => {
        try {
            setIsGeneratingInvite(true);
            const response = await inviteAPI.createInvite();
            const invite = response.data.data;
            setNewLink(invite.link);
            await loadInvites();
            showMessage('Link generado correctamente', 'success');
        } catch (err) {
            showMessage('Error al generar el link', 'error');
        } finally {
            setIsGeneratingInvite(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        showMessage('Link copiado al portapapeles', 'success');
        setTimeout(() => setCopied(false), 3000);
    };

    // Actualizar perfil
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const data = { username, email };
            const response = await userAPI.updateProfile(data);
            showMessage('Perfil actualizado correctamente', 'success');

            // Actualizar usuario en localStorage
            const savedUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...savedUser, username, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            if (onProfileUpdate) {
                onProfileUpdate(updatedUser);
            }

            setTimeout(() => {
                setIsEditing(false);
                setLoading(false);
            }, 1500);
        } catch (err) {
            showMessage('❌ ' + (err.response?.data?.error || 'Error al actualizar'), 'error');
            setLoading(false);
        }
    };

    // Cambiar contraseña
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (newPassword !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            setLoading(false);
            return;
        }

        try {
            await userAPI.updateProfile({ currentPassword, newPassword });
            showMessage('Contraseña cambiada correctamente', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                setIsChangingPassword(false);
                setLoading(false);
            }, 1500);
        } catch (err) {
            showMessage('❌ ' + (err.response?.data?.error || 'Error al cambiar contraseña'), 'error');
            setLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
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
        <div className="profile-menu">
            {/* Botón de perfil */}
            <button
                className={`profile-menu-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Configuración"
            >
        <span className="profile-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </span>
                <span className="profile-username">{user?.username || 'Usuario'}</span>
                <span className="profile-icon">⚙️</span>
            </button>

            {/* Menú desplegable */}
            {isOpen && (
                <div className="profile-dropdown">
                    {/* Header del usuario */}
                    <div className="dropdown-header">
                        <div className="dropdown-avatar">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="dropdown-name">{user?.username || 'Usuario'}</div>
                            <div className="dropdown-email">{user?.email || 'Email'}</div>
                        </div>
                    </div>

                    <div className="dropdown-divider" />

                    {/* Opción: Editar perfil */}
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsEditing(!isEditing);
                            setIsChangingPassword(false);
                        }}
                    >
                        <span className="dropdown-icon"></span>
                        {isEditing ? 'Ocultar edición' : 'Editar perfil'}
                    </button>

                    {/* Formulario de edición */}
                    {isEditing && (
                        <div className="dropdown-form">
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Nombre de usuario</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="dropdown-save-btn" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Opción: Cambiar contraseña */}
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsChangingPassword(!isChangingPassword);
                            setIsEditing(false);
                        }}
                    >
                        <span className="dropdown-icon">🔑</span>
                        {isChangingPassword ? 'Ocultar cambio' : 'Cambiar contraseña'}
                    </button>

                    {/* Formulario de cambio de contraseña */}
                    {isChangingPassword && (
                        <div className="dropdown-form">
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label>Contraseña actual</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nueva contraseña</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirmar nueva contraseña</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button type="submit" className="dropdown-save-btn" disabled={loading}>
                                    {loading ? 'Cambiando...' : '🔒 Cambiar contraseña'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="dropdown-divider" />

                    {/* Sección de Invitaciones */}
                    <div className="dropdown-invite-section">
                        <div className="dropdown-invite-header">
                            <span className="dropdown-icon"></span>
                            <span>Invitar a alguien</span>
                        </div>

                        <button
                            className="dropdown-invite-btn"
                            onClick={generateInvite}
                            disabled={isGeneratingInvite}
                        >
                            {isGeneratingInvite ? 'Generando...' : 'Generar link de invitación'}
                        </button>

                        {newLink && (
                            <div className="dropdown-invite-link">
                                <span className="invite-link-text">{newLink}</span>
                                <button
                                    className="invite-copy-btn"
                                    onClick={() => copyToClipboard(newLink)}
                                >
                                    {copied ? '✓' : '📋'}
                                </button>
                            </div>
                        )}

                        {/* Lista de invitaciones pendientes */}
                        <div className="dropdown-invite-list">
                            {loadingInvites ? (
                                <p className="invite-loading">Cargando...</p>
                            ) : invites.length > 0 ? (
                                invites.slice(0, 3).map((invite) => (
                                    <div key={invite.id} className="invite-item">
                    <span className="invite-item-token">
                      {invite.token.substring(0, 12)}...
                    </span>
                                        <span className={`invite-item-status ${invite.used ? 'used' : 'pending'}`}>
                      {invite.used ? '✓ Usado' : '⏳ Pendiente'}
                    </span>
                                        <span className="invite-item-date">
                      {formatDate(invite.expiresAt)}
                    </span>
                                    </div>
                                ))
                            ) : (
                                <p className="invite-empty">No hay invitaciones</p>
                            )}
                        </div>
                    </div>

                    <div className="dropdown-divider" />

                    {/* Cerrar sesión */}
                    <button
                        className="dropdown-item logout"
                        onClick={onLogout}
                    >
                        <span className="dropdown-icon"></span>
                        Cerrar sesión
                    </button>

                    {/* Mensaje de feedback */}
                    {message && (
                        <div className={`dropdown-message ${messageType}`}>
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;