import { AppDataSource } from '../config/database.config';
import { User } from '../models/User.model';

export class UserRepository{
    private repository = AppDataSource.getRepository(User);

    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return await this.repository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.repository.findOne({
            where: {username},
        });
    }

    async findById(id: string): Promise<User | null>{
        return await this.repository.findOne({
            where: {id},
        });
    }

    async findAll(): Promise<User[]>{
        return await this.repository.find();
    }

    async update(id: string, userData: Partial<User>): Promise<User | null> {
        await this.repository.update(id, userData);
        return await this.findById(id);
    }

    async delete(id: string): Promise<Boolean> {
        const result = await this.repository.delete(id);
        return  result.affected ? result.affected > 0 : false;
    }
}