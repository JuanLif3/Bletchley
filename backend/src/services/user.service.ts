import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/User.model';
import { UpdateUserRequestDTO, UpdateUserResponseDTO, DeleteUserResponseDTO, GetUserResponseDTO } from '../dtos/user.dto';
import { env } from '../config/env.config';
export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async findById(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async findByIdWithDetails(id: string): Promise<GetUserResponseDTO | null> {
        const user = await this.userRepository.findById(id);

        if(!user) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            isGhost: user.isGhost,
            createdAt: user.createdAt,
            lastSeen: user.lastSeen,
        };
    }

    async updateUser(userId: string, updateData: UpdateUserRequestDTO): Promise<UpdateUserResponseDTO> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar si el nuevo username ya existe (si se está cambiando)
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = await this.userRepository.findByUsername(updateData.username);
            if (existingUser) {
                throw new Error('El nombre de usuario ya está en uso');
            }
        }

        // Verificar si el nuevo email ya existe (si se está cambiando)
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(updateData.email);
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }
        }

        // Preparar datos para actualizar
        const updatePayload: Partial<User> = {};

        if (updateData.username) {
            updatePayload.username = updateData.username;
        }

        if (updateData.email) {
            updatePayload.email = updateData.email;
        }

        // Cambiar contraseña si se proporciona
        if (updateData.currentPassword && updateData.newPassword) {
            const isValidPassword = await bcrypt.compare(updateData.currentPassword, user.passwordHash);
            if (!isValidPassword) {
                throw new Error('La contraseña actual es incorrecta');
            }

            const saltRounds = env.SALT_ROUNDS;
            updatePayload.passwordHash = await bcrypt.hash(updateData.newPassword, saltRounds);
        }

        // Actualizar usuario
        const updatedUser = await this.userRepository.update(userId, updatePayload);

        if (!updatedUser) {
            throw new Error('Error al actualizar el usuario');
        }

        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            updatedAt: updatedUser.updatedAt,
            message: 'Perfil actualizado exitosamente',
        };
    }

    async deleteUser(userId: string):Promise<DeleteUserResponseDTO> {
        const user = await this.userRepository.delete(userId);

        if(!user) {
            throw new Error('Usuario no encontrado');
        }

        const deleted = await this.userRepository.delete(userId);

        if (!deleted) {
            throw new Error('Error al eliminar el usuario');
        }

        return {
            success: true,
            message: 'Usuario eliminado exitosamente',
        };
    }

    async updateLastSeen(userId: string): Promise<void> {
        await this.userRepository.updateLastSeen(userId);
    }

}