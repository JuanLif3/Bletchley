import { FastifyInstance } from 'fastify';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ChatController } from '../controllers/chat.controller';

export async function chatRoutes(fastify: FastifyInstance) {
    const chatController = new ChatController();

    // * Crear chat individual
    fastify.post('/chats', {
        preHandler: AuthMiddleware.verifyToken,
        handler: chatController.createChat.bind(chatController),
    });

    // * Obtener todos los chats del usuario
    fastify.get('/chats', {
        preHandler: AuthMiddleware.verifyToken,
        handler: chatController.getUserChats.bind(chatController),
    });

    // * Obtener detalles de un chat
    fastify.get('/chats/:chatId', {
        preHandler: AuthMiddleware.verifyToken,
        handler: chatController.getChatDetails.bind(chatController),
    });

    // * Eliminar chat
    fastify.delete('/chats/:chatId', {
        preHandler: AuthMiddleware.verifyToken,
        handler: chatController.deleteChat.bind(chatController),
    });
}