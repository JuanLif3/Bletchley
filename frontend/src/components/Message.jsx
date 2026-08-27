import { useState, useEffect } from 'react';
import cryptoService from '../services/crypto.service';
import '../styles/Message.css';

function Message({ message }) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnMessage = message.senderId === currentUser?.id;
    const [decryptedContent, setDecryptedContent] = useState(message.content);
    const [isDecrypted, setIsDecrypted] = useState(false);

    useEffect(() => {
        const decryptMessage = async () => {
            // Si el mensaje no está cifrado, mostrarlo tal cual
            if (!message.encrypted) {
                setDecryptedContent(message.content);
                setIsDecrypted(true);
                return;
            }

            try {
                // Obtener la clave privada del usuario
                let privateKey = localStorage.getItem('privateKey');
                if (!privateKey) {
                    // Intentar descifrar la clave privada cifrada
                    const encrypted = JSON.parse(localStorage.getItem('encryptedPrivateKey') || 'null');
                    if (encrypted) {
                        const password = prompt('Ingresa tu contraseña para descifrar mensajes:');
                        if (password) {
                            privateKey = cryptoService.decryptPrivateKey(
                                encrypted.ciphertext,
                                encrypted.nonce,
                                password
                            );
                            localStorage.setItem('privateKey', privateKey);
                        }
                    }
                }

                if (!privateKey) {
                    setDecryptedContent('🔒 Mensaje cifrado (necesitas tu contraseña)');
                    return;
                }

                // Obtener la clave pública del remitente
                // En un caso real, se obtiene del backend
                // Por ahora, asumimos que está disponible
                const senderPublicKey = message.senderPublicKey;
                if (!senderPublicKey) {
                    setDecryptedContent('🔒 Mensaje cifrado (falta clave pública)');
                    return;
                }

                // Descifrar mensaje
                const decrypted = cryptoService.decryptMessage(
                    message.content,
                    message.nonce,
                    sodium.from_base64(privateKey),
                    sodium.from_base64(senderPublicKey)
                );

                setDecryptedContent(decrypted);
                setIsDecrypted(true);
            } catch (error) {
                console.error('Error al descifrar mensaje:', error);
                setDecryptedContent('🔒 Mensaje cifrado (no se pudo descifrar)');
            }
        };

        decryptMessage();
    }, [message]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
            {!isOwnMessage && (
                <div className="message-sender">{message.senderUsername}</div>
            )}
            <div className="message-bubble">
                <div className="message-content">{decryptedContent}</div>
                <div className="message-time">{formatTime(message.createdAt)}</div>
            </div>
        </div>
    );
}

export default Message;