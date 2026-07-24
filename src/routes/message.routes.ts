import { FastifyInstance } from 'fastify';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { MessageController } from '../controllers/message.controller';

export async function messageRoutes(fastify: FastifyInstance) {
    const messageController = new MessageController();

    // * Enviar mensaje (HTTP)
    fastify.post('/messages', {
        preHandler: AuthMiddleware.verifyToken,
        handler: messageController.sendMessage.bind(messageController),
    });

    // * Obtener historial de mensajes de un chat
    fastify.get('/chats/:chatId/messages', {
        preHandler: AuthMiddleware.verifyToken,
        handler: messageController.getMessages.bind(messageController),
    });
}