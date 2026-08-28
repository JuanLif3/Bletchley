import { useState, useEffect } from 'react';
import cryptoService from '../services/crypto.service';
import '../styles/Message.css';

function Message({ message, otherPublicKey }) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnMessage = message.senderId === currentUser?.id;
    const [decryptedContent, setDecryptedContent] = useState('Descifrando...');

    useEffect(() => {
        const decryptMessage = async () => {
            // Si es mensaje propio y ya tiene contenido local (optimista), mostrar directamente
            if (isOwnMessage && message.isLocal) {
                setDecryptedContent(message.content);
                return;
            }

            // Si es mensaje propio y NO es local, intentar obtener contenido de localStorage
            if (isOwnMessage && !message.isLocal) {
                const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '{}');
                if (sentMessages[message.id]) {
                    setDecryptedContent(sentMessages[message.id]);
                    return;
                } else {
                    setDecryptedContent('✅ Mensaje enviado');
                    return;
                }
            }

            try {
                // Extraer JSON cifrado
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
                let privateKey = localStorage.getItem('privateKey');
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
                            } catch (decryptionError) {
                                console.error('Contraseña incorrecta o datos corruptos');
                            }
                        }
                    }
                }

                if (!privateKey) {
                    setDecryptedContent('🔒 Mensaje cifrado (necesitas contraseña)');
                    return;
                }

                // Para mensajes de otros, usar la clave pública del remitente
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
        };

        decryptMessage();
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