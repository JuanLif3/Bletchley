import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import ProfileMenu from './ProfileMenu';
import '../styles/ChatList.css';

function ChatList({ onSelectChat, onLogout, onProfileUpdate }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getChats();
            setChats(response.data.data);
        } catch (err) {
            console.error('Error al cargar chats:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) {
            return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    if (loading) {
        return <div className="chat-list-loading">Cargando chats...</div>;
    }

    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <h2>Bletchley</h2>
                <div className="user-info">{user?.username || 'Usuario'}</div>
            </div>

            <div className="chat-list-scroll">
                {chats.length === 0 ? (
                    <div className="chat-list-empty">
                        <div className="icon">💬</div>
                        <p>Sin conversaciones</p>
                        <p className="hint">Inicia un chat con otro usuario</p>
                    </div>
                ) : (
                    <div className="chat-list-items">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className="chat-item"
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <div className={`chat-avatar ${chat.isGroup ? 'group' : ''}`}>
                                    {chat.isGroup ? '👥' : getInitials(chat.otherParticipant?.username)}
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name">
                                        {chat.isGroup ? chat.name : chat.otherParticipant?.username || 'Usuario'}
                                    </div>
                                    <div className="chat-last-message">
                                        {chat.lastMessage?.content || 'Sin mensajes'}
                                    </div>
                                </div>
                                <div className="chat-time">
                                    {formatTime(chat.lastMessageAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProfileMenu
                user={user}
                onLogout={onLogout}
                onProfileUpdate={onProfileUpdate}
            />
        </div>
    );
}

export default ChatList;