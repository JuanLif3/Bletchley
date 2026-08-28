import { FastifyInstance } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { MessageService } from '../services/message.service';
import { UserRepository } from '../repositories/user.repository';
import { JWTUser } from '../types/jwt.types';

interface WebSocketClient {
    socket: any;
    userId: string;
    chatId?: string;
    username: string;
}

export class ChatWebSocketHandler {
    private clients: Map<string, WebSocketClient> = new Map();
    private messageService: MessageService;
    private userRepository: UserRepository;

    constructor() {
        this.messageService = new MessageService();
        this.userRepository = new UserRepository();
    }

    async handleConnection(fastify: FastifyInstance, socket: any, req: any) {
        try {
            const url = new URL(req.url, 'http://localhost');
            const token = url.searchParams.get('token');

            if (!token) {
                socket.send(JSON.stringify({
                    type: 'error',
                    data: { message: 'Token requerido' }
                }));
                socket.close();
                return;
            }

            const decoded = jwt.verify(token, env.JWT_SECRET) as JWTUser;

            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                socket.send(JSON.stringify({
                    type: 'error',
                    data: { message: 'Usuario no encontrado' }
                }));
                socket.close();
                return;
            }

            const clientId = socket.id || Date.now().toString();
            this.clients.set(clientId, {
                socket,
                userId: decoded.userId,
                username: user.username,
            });

            console.log(`Usuario ${user.username} conectado`);

            socket.send(JSON.stringify({
                type: 'connected',
                data: {
                    userId: decoded.userId,
                    username: user.username,
                    message: 'Conectado al chat'
                }
            }));

            socket.on('message', async (message: string) => {
                await this.handleMessage(clientId, message);
            });

            socket.on('close', () => {
                this.clients.delete(clientId);
                console.log(`Usuario ${user.username} desconectado`);
            });

        } catch (error: any) {
            console.error('Error en conexion.', error);
            socket.send(JSON.stringify({
                type: 'error',
                data: { message: 'Error de autenticacion' }
            }));
            socket.close();
        }
    }

    private async handleMessage(clientId: string, message: string) {
        try {
            const client = this.clients.get(clientId);
            if (!client) return;

            const parsed = JSON.parse(message);

            if (parsed.type === 'join') {
                client.chatId = parsed.chatId;
                console.log(`${client.username} se unió al chat ${parsed.chatId}`);
                return;
            }

            if (parsed.type === 'typing') {
                const response = {
                    type: 'typing',
                    data: {
                        chatId: parsed.chatId,
                        userId: client.userId,
                        username: client.username,
                        isTyping: parsed.isTyping
                    }
                };
                const responseString = JSON.stringify(response);
                this.broadcastToChat(parsed.chatId, responseString, clientId);
                return;
            }

            if (parsed.type === 'message') {
                const { chatId, content, tempId } = parsed;

                const savedMessage = await this.messageService.sendMessage(client.userId, {
                    chatId,
                    content,
                });

                // ! Enviar confirmación al emisor con el ID real del mensaje
                const ack = {
                    type: 'message_ack',
                    data: {
                        tempId: tempId,
                        id: savedMessage.id,
                        chatId: savedMessage.chatId,
                    }
                };
                client.socket.send(JSON.stringify(ack));

                const sender = await this.userRepository.findById(client.userId);

                const response = {
                    type: 'message',
                    data: {
                        id: savedMessage.id,
                        chatId: savedMessage.chatId,
                        senderId: savedMessage.senderId,
                        senderUsername: client.username,
                        content: savedMessage.content,
                        createdAt: savedMessage.createdAt,
                    }
                };

                const responseString = JSON.stringify(response);
                this.broadcastToChat(chatId, responseString);
            }

        } catch (error) {
            console.error('Error en mensaje WebSocket:', error);
        }
    }

    private broadcastToChat(chatId: string, message: string, excludeClientId?: string) {
        for (const [id, client] of this.clients) {
            if (id !== excludeClientId && client.chatId === chatId) {
                client.socket.send(message);
            }
        }
    }
}