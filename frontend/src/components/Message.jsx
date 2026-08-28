import { useState, useEffect } from 'react';
import cryptoService from '../services/crypto.service';
import '../styles/Message.css';

// Función nativa para convertir Base64 a Bytes
const base64ToBytes = (base64) => {
    const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = window.atob(standardBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

function Message({ message, otherPublicKey }) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnMessage = message.senderId === currentUser?.id;
    const [decryptedContent, setDecryptedContent] = useState('Descifrando...');

    useEffect(() => {
        const decryptMessage = async () => {
            try {
// 1. Extraer el JSON cifrado (Soporta String u Objeto)
                let parsedContent;
                try {
                    parsedContent = typeof message.content === 'string'
                        ? JSON.parse(message.content)
                        : message.content;
                } catch (e) {
                    // Si falla, es un mensaje viejo en texto plano
                    setDecryptedContent(String(message.content));
                    return;
                }

                if (!parsedContent || !parsedContent.ciphertext || !parsedContent.nonce) {
                    setDecryptedContent(String(message.content));
                    return;
                }

                if (!parsedContent.ciphertext || !parsedContent.nonce) {
                    setDecryptedContent(message.content);
                    return;
                }

                // 2. Obtener tu clave privada
                let privateKey = localStorage.getItem('privateKey');
                if (!privateKey) {
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
                    setDecryptedContent('🔒 Mensaje cifrado (necesitas contraseña)');
                    return;
                }

                // 3. Determinar la clave pública correcta
                const targetPublicKey = isOwnMessage
                    ? otherPublicKey // Si lo enviaste tú, usas la clave del destinatario
                    : (message.sender?.publicKey || message.senderPublicKey || otherPublicKey);

                if (!targetPublicKey) {
                    setDecryptedContent('🔒 (Falta clave pública del contacto)');
                    return;
                }

                // 4. Descifrar con los bytes correctos
                const decrypted = cryptoService.decryptMessage(
                    parsedContent.ciphertext,
                    parsedContent.nonce,
                    base64ToBytes(privateKey),
                    base64ToBytes(targetPublicKey)
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