import { useState, useEffect, useRef } from 'react';
import { messageAPI, chatAPI, keysAPI } from '../services/api';
import websocketService from '../services/websocket';
import Message from './Message';
import MessageInput from './MessageInput';
import '../styles/Chat.css';
import cryptoService from '../services/crypto.service';

function Chat({ chatId, onBack }) {
    const [messages, setMessages] = useState([]);
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otherPublicKey, setOtherPublicKey] = useState(null);
    const messagesEndRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const pendingMessages = useRef({}); // tempId -> { content }

    useEffect(() => {
        loadChatDetails();
        loadMessages();
        websocketService.joinChat(chatId);

        const handleMessage = (data) => {
            if (data.chatId === chatId) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleAck = (data) => {
            if (data.chatId === chatId) {
                const pending = pendingMessages.current[data.tempId];
                if (pending) {
                    // Guardar contenido original en localStorage
                    const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '{}');
                    sentMessages[data.id] = pending.content;
                    localStorage.setItem('sentMessages', JSON.stringify(sentMessages));

                    // Reemplazar mensaje optimista con el real
                    setMessages(prev => prev.map(m =>
                        m.id === data.tempId ? { ...m, id: data.id } : m
                    ));

                    delete pendingMessages.current[data.tempId];
                }
            }
        };

        websocketService.on('message', handleMessage);
        websocketService.on('message_ack', handleAck);

        return () => {
            websocketService.off('message', handleMessage);
            websocketService.off('message_ack', handleAck);
        };
    }, [chatId]);

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages]);

    const loadChatDetails = async () => {
        try {
            const response = await chatAPI.getChatDetails(chatId);
            const chatData = response.data.data;
            setChat(chatData);

            const other = chatData.participants?.find(p => p.userId !== currentUser?.id);
            if (other) {
                try {
                    const pkResponse = await keysAPI.getPublicKey(other.userId);
                    setOtherPublicKey(pkResponse.data.data.publicKey);
                } catch (e) {
                    console.warn("El destinatario aún no tiene clave pública generada");
                }
            }
        } catch (err) {
            console.error('Error al cargar detalles:', err);
        }
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await messageAPI.getMessages(chatId);
            const data = response.data.data;
            // Si hay mensajes propios, intentar obtener su contenido original de localStorage
            const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '{}');
            const enriched = data.map(msg => {
                if (msg.senderId === currentUser?.id && sentMessages[msg.id]) {
                    return { ...msg, content: sentMessages[msg.id] };
                }
                return msg;
            });
            setMessages(enriched);
        } catch (err) {
            console.error('Error al cargar mensajes:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getPrivateKey = () => {
        // Primero intentar con la clave en memoria
        let privateKey = cryptoService.getCachedPrivateKey();
        if (privateKey) return privateKey;

        privateKey = localStorage.getItem('privateKey');
        if (!privateKey) {
            const encrypted = JSON.parse(localStorage.getItem('encryptedPrivateKey') || 'null');
            if (encrypted) {
                const password = prompt('Ingresa tu contraseña para desbloquear tus mensajes:');
                if (password) {
                    try {
                        privateKey = cryptoService.decryptPrivateKey(
                            encrypted.ciphertext,
                            encrypted.nonce,
                            password
                        );
                        localStorage.setItem('privateKey', privateKey);
                        cryptoService.setCachedPrivateKey(privateKey);
                    } catch (e) {
                        alert('Contraseña incorrecta');
                        return null;
                    }
                }
            }
        }
        if (privateKey) cryptoService.setCachedPrivateKey(privateKey);
        return privateKey;
    };

    const handleSendMessage = async (content) => {
        if (!content.trim()) return;

        try {
            const other = chat?.participants?.find(p => p.userId !== currentUser.id);
            if (!other) return;

            let recipientPublicKey = otherPublicKey;

            if (!recipientPublicKey) {
                try {
                    const response = await keysAPI.getPublicKey(other.userId);
                    recipientPublicKey = response.data.data.publicKey;
                    setOtherPublicKey(recipientPublicKey);
                } catch (err) {
                    alert('🔒 El destinatario aún no ha generado sus claves de cifrado. No puedes enviarle mensajes seguros hasta que inicie sesión.');
                    return;
                }
            }

            const userPrivateKey = getPrivateKey();
            if (!userPrivateKey) {
                alert('No se pudo obtener tu clave privada.');
                return;
            }

            const encrypted = cryptoService.encryptMessage(
                content,
                userPrivateKey,
                recipientPublicKey
            );

            const secureContent = JSON.stringify({
                ciphertext: encrypted.ciphertext,
                nonce: encrypted.nonce
            });

            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Guardar pendiente para el ack
            pendingMessages.current[tempId] = { content };

            // Agregar mensaje optimista
            const optimisticMessage = {
                id: tempId,
                chatId,
                senderId: currentUser.id,
                senderUsername: currentUser.username,
                content: content, // contenido original
                createdAt: new Date().toISOString(),
                isLocal: true
            };
            setMessages(prev => [...prev, optimisticMessage]);

            // Enviar por WebSocket con tempId
            websocketService.sendMessage(chatId, secureContent, tempId);

        } catch (error) {
            console.error('Error al cifrar mensaje:', error);
            alert('❌ Ocurrió un error interno al cifrar el mensaje.');
        }
    };

    const getChatName = () => {
        if (!chat) return 'Chat';
        if (chat.isGroup) return chat.name || 'Grupo';
        const other = chat.participants?.find(p => p.userId !== currentUser?.id);
        return other?.user?.username || other?.username || 'Usuario';
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
                    messages.map((msg) => (
                        <Message
                            key={msg.id}
                            message={msg}
                            otherPublicKey={otherPublicKey}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={handleSendMessage} />
        </div>
    );
}

export default Chat;