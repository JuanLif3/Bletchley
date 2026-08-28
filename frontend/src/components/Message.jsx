import { useState, useEffect } from 'react';
import cryptoService from '../services/crypto.service';
import '../styles/Message.css';

function Message({ message, otherPublicKey }) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnMessage = message.senderId === currentUser?.id;
    const [decryptedContent, setDecryptedContent] = useState('Descifrando...');

    useEffect(() => {
        // Si es mensaje propio y tenemos su contenido original, mostrarlo directamente
        if (isOwnMessage) {
            const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '{}');
            if (sentMessages[message.id] || message.isLocal) {
                setDecryptedContent(sentMessages[message.id] || message.content);
                return;
            } else {
                // No tenemos el contenido original, mostramos "Enviado"
                setDecryptedContent('✅ Mensaje enviado');
                return;
            }
        }

        // Si es mensaje de otro usuario, intentar descifrar
        try {
            let parsedContent;
            try {
                parsedContent = typeof message.content === 'string'
                    ? JSON.parse(message.content)
                    : message.content;
            } catch (e) {
                setDecryptedContent(String(message.content));
                return;
            }

            if (!parsedContent || !parsedContent.ciphertext || !parsedContent.nonce) {
                setDecryptedContent(String(message.content));
                return;
            }

            // Obtener clave privada
            let privateKey = localStorage.getItem('privateKey') || cryptoService.getCachedPrivateKey();
            if (!privateKey) {
                const encrypted = JSON.parse(localStorage.getItem('encryptedPrivateKey') || 'null');
                if (encrypted) {
                    const password = prompt('Ingresa tu contraseña para descifrar mensajes:');
                    if (password) {
                        try {
                            privateKey = cryptoService.decryptPrivateKey(
                                encrypted.ciphertext,
                                encrypted.nonce,
                                password
                            );
                            localStorage.setItem('privateKey', privateKey);
                            cryptoService.setCachedPrivateKey(privateKey);
                        } catch (error) {
                            console.error('Contraseña incorrecta');
                        }
                    }
                }
            }

            if (!privateKey) {
                setDecryptedContent('🔒 Mensaje cifrado (necesitas contraseña)');
                return;
            }

            const senderPublicKey = message.sender?.publicKey || message.senderPublicKey || otherPublicKey;
            if (!senderPublicKey) {
                setDecryptedContent('🔒 (Falta clave pública del contacto)');
                return;
            }

            const decrypted = cryptoService.decryptMessage(
                parsedContent.ciphertext,
                parsedContent.nonce,
                privateKey,
                senderPublicKey
            );
            setDecryptedContent(decrypted);
        } catch (error) {
            console.error('Error al descifrar mensaje:', error);
            setDecryptedContent('🔒 (No se pudo descifrar)');
        }
    }, [message, isOwnMessage, otherPublicKey]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
            {!isOwnMessage && (
                <div className="message-sender">{message.sender?.username || message.senderUsername}</div>
            )}
            <div className="message-bubble">
                <div className="message-content">{decryptedContent}</div>
                <div className="message-time">{formatTime(message.createdAt)}</div>
            </div>
        </div>
    );
}

export default Message;