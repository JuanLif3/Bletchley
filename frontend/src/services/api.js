import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// * Interceptor para agregar token a todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// * API de autenticación
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// * API de usuarios
export const userAPI = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (data) => api.put('/users/me', data),
    deleteAccount: () => api.delete('/users/me'),
};

// * API de chats
export const chatAPI = {
    createChat: (participantId) => api.post('/chats', { participantId }),
    getChats: () => api.get('/chats'),
    getChatDetails: (chatId) => api.get(`/chats/${chatId}`),
    deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
};

// * API de mensajes
export const messageAPI = {
    sendMessage: (chatId, content) => api.post('/messages', { chatId, content }),
    getMessages: (chatId, limit = 50, offset = 0) =>
        api.get(`/chats/${chatId}/messages?limit=${limit}&offset=${offset}`),
};

export default api;