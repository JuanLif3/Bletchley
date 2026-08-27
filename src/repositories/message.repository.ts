import { AppDataSource } from '../config/database.config';
import { Message } from '../models/Message.model';

export class MessageRepository {
    private repository = AppDataSource.getRepository(Message);

    async create(messageData: Partial<Message>): Promise<Message> {
        const message = this.repository.create(messageData);
        return await this.repository.save(message);
    }

    async findByChatId (chatId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
        return await this.repository.find({
            where: { chatId },
            relations: {
                sender: true,
            },
            order: {
                createdAt: 'DESC',
            },
            skip: offset,
            take: limit,
        });
    }

    async findById(id: string): Promise<Message | null> {
        return await this.repository.findOne({
            where: { id },
            relations: {
                sender: true,
            },
        });
    }

    async deleteByChatId(chatId: string): Promise<boolean> {
        const result = await this.repository.delete({ chatId });
        return result.affected ? result.affected > 0 : false;
    }

    async deleteBySenderId(senderId: string): Promise<boolean> {
        const result = await this.repository.delete({ senderId });
        return result.affected ? result.affected > 0 : false;
    }
}