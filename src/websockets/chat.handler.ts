import { FastifyInstance } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { MessageService } from '../services/message.service';
import { UserRepository } from '../repositories/user.repository';
import { JWTUser } from '../types/jwt.types';

interface WebSocketClient{
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

    async handleConnection (fastify: FastifyInstance, socket: any, req: any) {
        try {
            // ! Obtener token de la URL (ws://...?token=xxx)
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

            // ! Verificar token
            const decoded = jwt.verify(token, env.JWT_SECRET) as JWTUser;

            // ! Verificar que el usuario existe
            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                socket.send(JSON.stringify({
                    type: 'error',
                    data: { message: 'Usuario no encontrado' }
                }));
                socket.close();
                return;
            }

            // ! Registrar cliente
            const clientId = socket.id || Date.now().toString();
            this.clients.set(clientId, {
                socket,
                userId: decoded.userId,
                username: user.username,
            });

            console.log(`Usuario ${user.username} conectado`);

            // ! Enviar confirmacion
            socket.send(JSON.stringify({
                type: 'connected',
                data: {
                    userId: decoded.userId,
                    username: user.username,
                    message: 'Conectado al chat'
                }
            }));

            // ! Manejar mensajes entrantes
            socket.on('message', async (message: string) => {
                await this.handleMessage(clientId, message);
            });

            // ! Manejar desconexion
            socket.on('close', () => {
                this.clients.delete(clientId);
                console.log(`Usuario ${user.username} desconectado`);
            });

        } catch (error: any) {
            console.error('Error en conexion.', error);
            socket.send(JSON.stringify({
                type: 'error',
                data: {message: 'Error de autenticacion'}
            }));
            socket.close();
        }
    }

    private async handleMessage(clientId: string, message: string) {
        try {
            const client = this.clients.get(clientId);
            if(!client) return;

            const parsed = JSON.parse(message);

            // ! Si el mensaje es para unirse a una chat
            if (parsed.type === 'join') {
                client.chatId = parsed.chatId;
                console.log(`${client.username} se unió al chat ${parsed.chatId}`);
                return;
            }

            // ! Indicador de escritura
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

            // ! Si es un mensaje de chat
            if (parsed.type === 'message') {
                const { chatId, content } = parsed;

                // ! Guardar en DB
                const savedMessage = await this.messageService.sendMessage(client.userId, {
                    chatId,
                    content,
                });

                // ! Obtener info dell usuario que envio el mensaje
                const sender = await this.userRepository.findById(client.userId);

                // ! Crear respuesta para broadcast
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