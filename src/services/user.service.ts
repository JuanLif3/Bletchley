import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { MessageRepository } from '../repositories/message.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { InviteRepository } from '../repositories/invite.repository';
import { User } from '../models/User.model';
import {
    RegisterUserDto,
    LoginUserDto,
    UpdateUserDto,
    UserResponseDto,
    AuthResponseDto,
    UpdateUserResponseDto,
    DeleteUserResponseDto,
} from '../dtos/user.dto';
import { env } from '../config/env.config';
import { TokenService } from './token.service';

export class UserService {
    private userRepository: UserRepository;
    private messageRepository: MessageRepository;
    private chatRepository: ChatRepository;
    private inviteRepository: InviteRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.messageRepository = new MessageRepository();
        this.chatRepository = new ChatRepository();
        this.inviteRepository = new InviteRepository();
    }

    // * Registrar usuario
    async register(data: RegisterUserDto): Promise<UserResponseDto> {
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }

        const existingUsername = await this.userRepository.findByUsername(data.username);
        if (existingUsername) {
            throw new Error('El nombre de usuario ya está en uso');
        }

        const saltRounds = env.SALT_ROUNDS;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const user = await this.userRepository.create({
            username: data.username,
            email: data.email,
            passwordHash: hashedPassword,
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        };
    }

    // * Login de usuario
    async login(data: LoginUserDto): Promise<AuthResponseDto> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Credenciales inválidas');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            env.JWT_SECRET as string,
            { expiresIn: env.JWT_EXPIRES_IN as string }
        );

        const refreshToken = TokenService.generateRefreshToken(user.id);

        await this.userRepository.updateLastSeen(user.id);

        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        };
    }

    // * Obtener clave pública
    async getPublicKey(userId: string): Promise<string | null> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user.publicKey || null;
    }

    // * Obtener usuario por ID
    async findById(id: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findById(id);
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        };
    }

    // * Actualizar usuario
    async update(userId: string, data: UpdateUserDto): Promise<UpdateUserResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const updatePayload: Partial<User> = {};

        if (data.username && data.username !== user.username) {
            const existing = await this.userRepository.findByUsername(data.username);
            if (existing) {
                throw new Error('El nombre de usuario ya está en uso');
            }
            updatePayload.username = data.username;
        }

        if (data.email && data.email !== user.email) {
            const existing = await this.userRepository.findByEmail(data.email);
            if (existing) {
                throw new Error('El email ya está registrado');
            }
            updatePayload.email = data.email;
        }

        if (data.currentPassword && data.newPassword) {
            const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
            if (!isValid) {
                throw new Error('La contraseña actual es incorrecta');
            }
            const saltRounds = env.SALT_ROUNDS;
            updatePayload.passwordHash = await bcrypt.hash(data.newPassword, saltRounds);
        }

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

    // * Eliminar usuario (normal)
    async delete(userId: string): Promise<DeleteUserResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
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

// * Auto-destrucción (eliminar TODOS los datos)
    async selfDestruct(userId: string): Promise<{ success: boolean; message: string }> {
        console.log('Iniciando auto-destrucción para usuario:', userId);

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // 1. Eliminar mensajes enviados por el usuario
        await this.messageRepository.deleteBySenderId(userId);
        console.log('Mensajes eliminados');

        // 2. Obtener todos los chats donde el usuario es participante
        const chats = await this.chatRepository.findByUserId(userId);
        console.log(`Chats encontrados: ${chats.length}`);

        // 3. Para cada chat, eliminar participantes y luego el chat
        for (const chat of chats) {
            // Primero eliminar todos los participantes
            await this.chatRepository.removeAllParticipants(chat.id);
            // Luego eliminar el chat
            await this.chatRepository.delete(chat.id);
            console.log(`Chat eliminado: ${chat.id}`);
        }

        // 4. Eliminar invitaciones del usuario
        await this.inviteRepository.deleteByCreatorId(userId);
        await this.inviteRepository.deleteByUsedById(userId);
        console.log('Invitaciones eliminadas');

        // 5. Eliminar el usuario
        const deleted = await this.userRepository.delete(userId);
        if (!deleted) {
            throw new Error('Error al eliminar el usuario');
        }
        console.log('Usuario eliminado');

        return {
            success: true,
            message: 'Cuenta y todos sus datos eliminados exitosamente',
        };
    }

    // * Guardar clave pública
    async savePublicKey(userId: string, publicKey: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        await this.userRepository.update(userId, { publicKey });
    }
}