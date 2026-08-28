class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
    }

    connect(token) {
        const wsUrl = `ws://localhost:3000/chat?token=${token}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket conectado');
            this.trigger('connected', { message: 'Conectado al chat' });
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Mensaje recibido:', data);
                this.trigger(data.type, data.data);
            } catch (error) {
                console.error('Error al parsear mensaje:', error);
            }
        };

        this.socket.onclose = () => {
            console.log('❌ WebSocket desconectado');
            this.trigger('disconnected', { message: 'Desconectado del chat' });
        };

        this.socket.onerror = (error) => {
            console.error('❌ Error en WebSocket:', error);
            this.trigger('error', { message: 'Error en la conexión' });
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket no está conectado');
        }
    }

    joinChat(chatId) {
        this.send({ type: 'join', chatId });
    }

    sendMessage(chatId, content, tempId = null) {
        this.send({ type: 'message', chatId, content, tempId });
    }

    sendTyping(chatId, isTyping) {
        this.send({ type: 'typing', chatId, isTyping });
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    trigger(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export default new WebSocketService();