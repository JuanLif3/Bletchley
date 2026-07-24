import '../styles/Message.css';

function Message({ message }) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnMessage = message.senderId === currentUser?.id;

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
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatTime(message.createdAt)}</div>
            </div>
        </div>
    );
}

export default Message;