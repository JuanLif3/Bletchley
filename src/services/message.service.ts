import { MessageRepository } from '../repositories/message.repository';
import { UserRepository } from '../repositories/user.repository';
import { Message } from '../models/Message.model';
import {
    SendMessageDto,
    MessageResponseDto,
    SendMessageResponseDTO,
} from '../dtos/message.dto';

export class MessageService {
    private messageRepository: MessageRepository;
    private userRepository: UserRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
        this.userRepository = new UserRepository();
    }

    async sendMessage(senderId: string, data: SendMessageDto): Promise<SendMessageResponseDTO> {
        // ! Verificar que el usuario existe
        const user = await this.userRepository.findById(senderId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // ! Crear mensaje
        const message = await this.messageRepository.create({
            chatId: data.chatId,
            senderId: senderId,
            content: data.content,
        });

        return {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt,
            message: 'Mensaje enviado exitosamente',
        };
    }

    async getChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<MessageResponseDTO[]> {
        const messages = await this.messageRepository.findByChatId(chatId, limit, offset);

        // ! Invertir para orden cronológico (más antiguos primero)
        messages.reverse();

        return messages.map((msg) => ({
            id: msg.id,
            chatId: msg.chatId,
            senderId: msg.senderId,
            senderUsername: msg.sender?.username || 'Usuario desconocido',
            content: msg.content,
            createdAt: msg.createdAt,
        }));
    }

    async deleteChatMessages(chatId: string): Promise<{message: string}> {
        await this.messageRepository.deleteByChatId(chatId);
        return {
            message: 'Mensajes eliminados exitosamente',
        };
    }
}