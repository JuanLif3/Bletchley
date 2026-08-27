import { useState, useEffect, useRef } from 'react';
import { messageAPI, chatAPI } from '../services/api';
import websocketService from '../services/websocket';
import Message from './Message';
import MessageInput from './MessageInput';
import '../styles/Chat.css';
import cryptoService from '../services/crypto.service';
import { keysAPI } from '../services/api';

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


    const handleSendMessage = async (content) => {
        if (!content.trim()) return;

        try {
            // 1. Obtener la clave pública del destinatario
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const chat = await chatAPI.getChatDetails(chatId);

            // Encontrar el otro participante
            const otherParticipant = chat.data.data.participants.find(
                p => p.userId !== currentUser.id
            );

            if (!otherParticipant) {
                console.error('No se encontró el destinatario');
                return;
            }

            // 2. Obtener o recuperar la clave pública del destinatario
            let recipientPublicKey = otherParticipant.publicKey;
            if (!recipientPublicKey) {
                // Si no está en el chat, pedirla al backend
                const response = await keysAPI.getPublicKey(otherParticipant.userId);
                recipientPublicKey = response.data.data.publicKey;
            }

            // 3. Obtener la clave privada del usuario actual (desde localStorage o generarla)
            let userPrivateKey = localStorage.getItem('privateKey');
            if (!userPrivateKey) {
                // Generar nuevas claves para el usuario
                const keyPair = cryptoService.generateKeyPair();
                userPrivateKey = cryptoService.getPrivateKey(keyPair);
                const publicKey = cryptoService.getPublicKey(keyPair);

                // Guardar clave pública en el backend
                await keysAPI.savePublicKey(publicKey);

                // Guardar clave privada en localStorage (cifrada con contraseña)
                const password = prompt('Ingresa tu contraseña para cifrar tu clave privada:');
                if (password) {
                    const encrypted = cryptoService.encryptPrivateKey(userPrivateKey, password);
                    localStorage.setItem('encryptedPrivateKey', JSON.stringify(encrypted));
                    localStorage.setItem('privateKey', userPrivateKey); // Temporal, se usará la cifrada
                }
            }

            // 4. Cifrar el mensaje
            const senderPrivateKey = sodium.from_base64(userPrivateKey);
            const recipientPublicKeyBytes = sodium.from_base64(recipientPublicKey);

            const encrypted = cryptoService.encryptMessage(
                content,
                senderPrivateKey,
                recipientPublicKeyBytes
            );

            // 5. Enviar el mensaje cifrado (contiene ciphertext y nonce)
            const payload = {
                chatId: chatId,
                content: encrypted.ciphertext,
                nonce: encrypted.nonce,
                encrypted: true
            };

            // Enviar por WebSocket
            websocketService.sendMessage(chatId, JSON.stringify(payload));

        } catch (error) {
            console.error('Error al cifrar mensaje:', error);
            // Fallback: enviar mensaje en texto plano
            websocketService.sendMessage(chatId, content);
        }
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