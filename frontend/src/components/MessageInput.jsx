import { useState, useRef } from 'react';
import '../styles/MessageInput.css';

function MessageInput({ onSend }) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <form className="message-input-container" onSubmit={handleSubmit}>
            <input
                type="text"
                className="message-input"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="message-send-btn" disabled={!message.trim()}>
                →
            </button>
        </form>
    );
}

export default MessageInput;