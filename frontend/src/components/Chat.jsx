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
            setMessages(response.data.data);
        } catch (err) {
            console.error('Error al cargar mensajes:', err);
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
            const other = chat?.participants?.find(p => p.userId !== currentUser.id);
            if (!other) return;

            let recipientPublicKey = otherPublicKey;

            if (!recipientPublicKey) {
                try {
                    const response = await keysAPI.getPublicKey(other.userId);
                    recipientPublicKey = response.data.data.publicKey;
                    setOtherPublicKey(recipientPublicKey); // Lo guardamos para los próximos
                } catch (err) {
                    alert('🔒 El destinatario aún no ha generado sus claves de cifrado. No puedes enviarle mensajes seguros hasta que inicie sesión.');
                    return;
                }
            }

            let userPrivateKey = localStorage.getItem('privateKey');
            if (!userPrivateKey) {
                const keyPair = cryptoService.generateKeyPair();
                userPrivateKey = cryptoService.getPrivateKey(keyPair);
                const publicKey = cryptoService.getPublicKey(keyPair);

                await keysAPI.savePublicKey(publicKey);

                const password = prompt('Ingresa tu contraseña para cifrar tu clave privada:');
                if (password) {
                    const encrypted = cryptoService.encryptPrivateKey(userPrivateKey, password);
                    localStorage.setItem('encryptedPrivateKey', JSON.stringify(encrypted));
                    localStorage.setItem('privateKey', userPrivateKey);
                }
            }

            const base64ToBytes = (base64) => {
                const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
                const binaryString = window.atob(standardBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes;
            };

            const senderPrivateKeyBytes = base64ToBytes(userPrivateKey);
            const recipientPublicKeyBytes = base64ToBytes(recipientPublicKey);

            const encrypted = cryptoService.encryptMessage(
                content,
                senderPrivateKeyBytes,
                recipientPublicKeyBytes
            );

            const secureContent = JSON.stringify({
                ciphertext: encrypted.ciphertext,
                nonce: encrypted.nonce
            });

            websocketService.sendMessage(chatId, secureContent);

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