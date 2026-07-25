import { AppDataSource } from '../config/database.config';
import { Invite } from '../models/Invite.model';

export class InviteRepository {
    private repository = AppDataSource.getRepository(Invite);

    async create(inviteData: Partial<Invite>): Promise<Invite> {
        const invite = this.repository.create(inviteData);
        return await this.repository.save(invite);
    }

    async findByToken(token: string): Promise<Invite | null> {
        return await this.repository.findOne({
            where: { token },
            relations: {
                creator: true,
                usedBy: true,
            },
        });
    }

    async findByCreator(creatorId: string): Promise<Invite[]> {
        return await this.repository.find({
            where: { creatorId },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async markAsUsed(token: string, userId: string): Promise<boolean> {
        const result = await this.repository.update(
            { token },
            { used: true, usedById: userId }
        );
        return result.affected ? result.affected > 0 : false;
    }

    async deleteExpired(): Promise<number> {
        const result = await this.repository
            .createQueryBuilder()
            .delete()
            .where('expires_at < NOW()')
            .execute();
        return result.affected || 0;
    }
}