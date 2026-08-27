import { AppDataSource } from '../config/database.config';
import { Chat } from '../models/Chat.model';
import { ChatParticipant } from '../models/ChatParticipant.model';
import { Message } from '../models/Message.model';

export class ChatRepository {
    private chatRepo = AppDataSource.getRepository(Chat);
    private participantRepo = AppDataSource.getRepository(ChatParticipant);
    private messageRepo = AppDataSource.getRepository(Message);

    async create(chatData: Partial<Chat>): Promise<Chat> {
        const chat = this.chatRepo.create(chatData);
        return await this.chatRepo.save(chat);
    }

    async addParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
        const participant = this.participantRepo.create({ chatId, userId });
        return await this.participantRepo.save(participant);
    }

    async findById(id: string): Promise<Chat | null> {
        return await this.chatRepo.findOne({
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
        const participantRecords = await this.participantRepo.find({
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

    async getParticipants(chatId: string): Promise<ChatParticipant[]> {
        return await this.participantRepo.find({
            where: { chatId },
            relations: ['user'],
        });
    }

    async findOneOnOneChat(userId1: string, userId2: string): Promise<Chat | null> {
        const participants1 = await this.participantRepo.find({
            where: { userId: userId1 },
            relations: ['chat', 'chat.participants'],
        });

        const participants2 = await this.participantRepo.find({
            where: { userId: userId2 },
            relations: ['chat', 'chat.participants'],
        });

        const chatIds1 = participants1.map(p => p.chatId);
        const chatIds2 = participants2.map(p => p.chatId);
        const commonChatIds = chatIds1.filter(id => chatIds2.includes(id));

        if (commonChatIds.length === 0) return null;

        for (const chatId of commonChatIds) {
            const chat = await this.chatRepo.findOne({
                where: { id: chatId, isGroup: false },
                relations: ['participants'],
            });
            if (chat) return chat;
        }
        return null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.chatRepo.delete({ id });
        return result.affected ? result.affected > 0 : false;
    }

    async removeParticipant(chatId: string, userId: string): Promise<boolean> {
        const result = await this.participantRepo.delete({ chatId, userId });
        return result.affected ? result.affected > 0 : false;
    }

    async removeAllParticipants(chatId: string): Promise<boolean> {
        const result = await this.participantRepo.delete({ chatId });
        return result.affected ? result.affected > 0 : false;
    }
}