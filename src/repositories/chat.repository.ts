import { AppDataSource } from '../config/database.config';
import { Chat } from '../models/Chat.model';
import { ChatParticipant } from '../models/ChatParticipant.model';
import { Message } from '../models/Message.model';

export class ChatRepository {
    private chatRepository = AppDataSource.getRepository(Chat);
    private participantRepository = AppDataSource.getRepository(ChatParticipant);
    private messageRepository = AppDataSource.getRepository(Message);

    async create(chatData: Partial<Chat>): Promise<Chat> {
        const chat = this.chatRepository.create(chatData);
        return await this.chatRepository.save(chat);
    }

    async addParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
        const participant = this.participantRepository.create({ chatId, userId });
        return await this.participantRepository.save(participant);
    }

    async findById(id: string): Promise<Chat | null> {
        return await this.chatRepository.findOne({
            where: { id },
            relations: ['participants', 'participants.user', 'messages', 'messages.sender', 'creator'],
            order: {
                messages: {
                    createdAt: 'ASC',
                },
            },
        });
    }

    async findByUserId(userId: string): Promise<Chat[]> {
        const participantRecords = await this.participantRepository.find({
            where: { userId },
            relations: ['chat', 'chat.participants', 'chat.participants.user', 'chat.messages', 'chat.messages.sender'],
            order: {
                chat: {
                    updatedAt: 'DESC',
                },
            },
        });

        return participantRecords.map(p => p.chat);
    }

    async findOneOnOneChat(userId1: string, userId2: string): Promise<Chat | null> {
        const participant1 = await this.participantRepository.find({
            where: { userId: userId1 },
            relations: ['chat', 'chat.participants'],
        });

        for (const p of participant1) {
            const chat = p.chat;
            if (!chat.isGroup) {
                const participants = chat.participants.map(p => p.userId);
                if (participants.includes(userId2) && participants.includes(userId1)) {
                    return chat;
                }
            }
        }
        return null;
    }

    async delete(id: string): Promise<boolean> {
        // TypeORM con CASCADE eliminará automáticamente los participantes y mensajes
        const result = await this.chatRepository.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async removeParticipant(chatId: string, userId: string): Promise<boolean> {
        const result = await this.participantRepository.delete({ chatId, userId });
        return result.affected ? result.affected > 0 : false;
    }
}