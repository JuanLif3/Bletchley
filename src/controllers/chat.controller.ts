import { FastifyRequest, FastifyReply } from 'fastify';
import { ChatService } from '../services/chat.service';
import { JWTUser } from '../types/jwt.types';
import { createChatSchema, chatIdParamSchema } from '../schemas/chat.schema';
import { CreateChatDto } from '../dtos/chat.dto';

export class ChatController {
    private chatService: ChatService;

    constructor() {
        this.chatService = new ChatService();
    }

    // * Crear chat individual
    async createChat(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;
            const validated = createChatSchema.parse(request.body);

            const data: CreateChatDto = {
                participantId: validated.participantId,
            };

            const result = await this.chatService.createOneOnOneChat(userFromToken.userId, data);

            return reply.status(201).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validación',
                    details: error.errors,
                });
            }

            if (error.message === 'Ya existe un chat entre estos usuarios') {
                return reply.status(409).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en createChat:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Obtener todos los chats del usuario
    async getUserChats(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;
            const chats = await this.chatService.getUserChats(userFromToken.userId);

            return reply.status(200).send({
                success: true,
                data: chats,
            });
        } catch (error: any) {
            console.error('Error en getUserChats:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Obtener detalles de un chat
    async getChatDetails(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;
            const params = chatIdParamSchema.parse(request.params);

            const chat = await this.chatService.getChatDetails(params.chatId, userFromToken.userId);

            return reply.status(200).send({
                success: true,
                data: chat,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validación',
                    details: error.errors,
                });
            }

            if (error.message === 'Chat no encontrado') {
                return reply.status(404).send({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message === 'No tienes acceso a este chat') {
                return reply.status(403).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en getChatDetails:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Eliminar chat
    async deleteChat(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;
            const params = chatIdParamSchema.parse(request.params);

            const result = await this.chatService.deleteChat(params.chatId, userFromToken.userId);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validación',
                    details: error.errors,
                });
            }

            if (error.message === 'Chat no encontrado') {
                return reply.status(404).send({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message === 'Solo el creador del chat puede eliminarlo') {
                return reply.status(403).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en deleteChat:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}