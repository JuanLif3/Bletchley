import { useState, useEffect, useRef } from 'react';
import { messageAPI, chatAPI } from '../services/api';
import websocketService from '../services/websocket';
import Message from './Message';
import MessageInput from './MessageInput';
import '../styles/Chat.css';

function Chat({ chatId, onBack }) {
    const [messages, setMessages] = useState([]);
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadChatDetails();
        loadMessages();
        websocketService.joinChat(chatId);

        const handleMessage = (data) => {
            if (data.chatId === chatId) {
                setMessages(prev => [...prev, data]);
                setTimeout(scrollToBottom, 50);
            }
        };

        websocketService.on('message', handleMessage);

        return () => {
            websocketService.off('message', handleMessage);
        };
    }, [chatId]);

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages]);

    const loadChatDetails = async () => {
        try {
            const response = await chatAPI.getChatDetails(chatId);
            setChat(response.data.data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await messageAPI.getMessages(chatId);
            setMessages(response.data.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (content) => {
        if (!content.trim()) return;
        websocketService.sendMessage(chatId, content);
    };

    const getChatName = () => {
        if (!chat) return 'Chat';
        if (chat.isGroup) return chat.name || 'Grupo';
        const other = chat.participants?.find(p => p.userId !== currentUser?.id);
        return other?.username || 'Usuario';
    };

    if (loading) {
        return <div className="chat-loading">Cargando mensajes...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button className="chat-back-btn" onClick={onBack}>←</button>
                <div className="chat-header-info">
                    <div className="chat-header-name">{getChatName()}</div>
                    <div className="chat-header-status">● En línea</div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="icon">💬</div>
                        <p>Sin mensajes</p>
                        <p className="hint">Envía el primer mensaje</p>
                    </div>
                ) : (
                    messages.map((msg) => <Message key={msg.id} message={msg} />)
                )}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={handleSendMessage} />
        </div>
    );
}

export default Chat;