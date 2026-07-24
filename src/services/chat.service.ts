import { ChatRepository } from '../repositories/chat.repository';
import { UserRepository } from '../repositories/user.repository';
import { MessageRepository } from '../repositories/message.repository';
import { Chat } from '../models/Chat.model';
import {
    CreateChatDto,
    GetChatsResponseDto,
    ChatDetailResponseDto,
    DeleteChatResponseDto,
} from '../dtos/chat.dto';

export class ChatService {
    private chatRepository: ChatRepository;
    private userRepository: UserRepository;
    private messageRepository: MessageRepository;

    constructor() {
        this.chatRepository = new ChatRepository();
        this.userRepository = new UserRepository();
        this.messageRepository = new MessageRepository();
    }

    // * Crear chat individual (1 a 1)
    async createOneOnOneChat(creatorId: string, data: CreateChatDto): Promise<{ id: string; message: string }> {
        // ! Verificar que el otro usuario existe
        const otherUser = await this.userRepository.findById(data.participantId);
        if (!otherUser) {
            throw new Error('El usuario no existe');
        }

        // ! Verificar que no sea el mismo usuario
        if (creatorId === data.participantId) {
            throw new Error('No puedes crear un chat contigo mismo');
        }

        // ! Verificar si ya existe un chat entre estos usuarios
        const existingChat = await this.chatRepository.findOneOnOneChat(creatorId, data.participantId);
        if (existingChat) {
            throw new Error('Ya existe un chat entre estos usuarios');
        }

        // ! Crear chat
        const chat = await this.chatRepository.create({
            isGroup: false,
            createdBy: creatorId,
        });

        // ! Agregar participantes
        await this.chatRepository.addParticipant(chat.id, creatorId);
        await this.chatRepository.addParticipant(chat.id, data.participantId);

        return {
            id: chat.id,
            message: 'Chat creado exitosamente',
        };
    }

// * Obtener todos los chats de un usuario
    async getUserChats(userId: string): Promise<GetChatsResponseDto[]> {
        const chats = await this.chatRepository.findByUserId(userId);

        const result: GetChatsResponseDto[] = [];

        for (const chat of chats) {
            // Encontrar el otro participante (para chats individuales)
            let otherParticipant = undefined;
            if (!chat.isGroup) {
                const otherUser = chat.participants?.find(p => p.userId !== userId);
                if (otherUser?.user) {
                    otherParticipant = {
                        id: otherUser.user.id,
                        username: otherUser.user.username,
                    };
                }
            }

            // Último mensaje
            let lastMessage = undefined;
            if (chat.messages && chat.messages.length > 0) {
                const lastMsg = chat.messages[chat.messages.length - 1];
                lastMessage = {
                    content: lastMsg.content,
                    createdAt: lastMsg.createdAt,
                };
            }

            result.push({
                id: chat.id,
                name: chat.name,
                isGroup: chat.isGroup,
                lastMessageAt: chat.updatedAt,
                otherParticipant,
                lastMessage,
            });
        }

        return result;
    }

    // * Obtener detalles de un chat
    async getChatDetails(chatId: string, userId: string): Promise<ChatDetailResponseDto> {
        const chat = await this.chatRepository.findById(chatId);
        if (!chat) {
            throw new Error('Chat no encontrado');
        }

        const isParticipant = chat.participants?.some(p => p.userId === userId);
        if (!isParticipant) {
            throw new Error('No tienes acceso a este chat');
        }

        return {
            id: chat.id,
            name: chat.name,
            isGroup: chat.isGroup,
            createdBy: chat.createdBy,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            participants: chat.participants?.map(p => ({
                id: p.id,
                userId: p.userId,
                username: p.user?.username || 'Usuario desconocido',
                joinedAt: p.joinedAt,
            })) || [],
            messages: chat.messages?.map(m => ({
                id: m.id,
                senderId: m.senderId,
                senderUsername: m.sender?.username || 'Usuario desconocido',
                content: m.content,
                createdAt: m.createdAt,
            })) || [],
        };
    }

    // * Eliminar chat
    async deleteChat(chatId: string, userId: string): Promise<DeleteChatResponseDto> {
        const chat = await this.chatRepository.findById(chatId);
        if (!chat) {
            throw new Error('Chat no encontrado');
        }

        // ! Solo el creador puede eliminar
        if (chat.createdBy !== userId) {
            throw new Error('Solo el creador del chat puede eliminarlo');
        }

        await this.chatRepository.delete(chatId);

        return {
            success: true,
            message: 'Chat eliminado exitosamente',
        };
    }
}