import { FastifyRequest, FastifyReply } from 'fastify';
import { MessageService } from '../services/message.service';
import { JWTUser } from '../types/jwt.types';
import { sendMessageSchema, chatIdParamSchema } from '../schemas/message.schema';
import { SendMessageDto } from '../dtos/message.dto';

export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    // * Enviar mensaje (HTTP)
    async sendMessage(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;
            const validated = sendMessageSchema.parse(request.body);

            const data: SendMessageDto = {
                chatId: validated.chatId,
                content: validated.content,
            };

            const result = await this.messageService.sendMessage(userFromToken.userId, data);

            return reply.status(201).send({
                succes: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validacion',
                    details: error.errors,
                });
            }

            console.error('Errir en enviar mensaje:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Obtener historial de mensajes
    async getMessages(request: FastifyRequest, reply: FastifyReply) {
        try {
            const params = chatIdParamSchema.parse(request.params);
            const { chatId } = params;

            // ! Parsear query params (offset y limit)
            const query = request.query as { limit?: string; offset?: string };
            const limit = query.limit ? parseInt(query.limit): 50;
            const offset = query.offset ? parseInt(query.offset): 0;

            const messages = await this.messageService.getChatMessages(chatId, limit, offset);

            return reply.status(200).send({
                success: true,
                data: messages,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validacion',
                    details: error.errors,
                });
            }

            console.error('Error en obtener mensajes:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servvidor',
            });
        }
    }
}