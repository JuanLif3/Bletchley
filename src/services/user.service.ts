import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/User.model';
import {
    RegisterUserDTO,
    LoginUserDTO,
    UpdateUserDTO,
    UserResponseDTO,
    AuthResponseDTO,
    UpdateUserResponseDTO,
    DeleteUserResponseDTO,
} from '../dtos/user.dto';
import { env } from '../config/env.config';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    // * Registrar usuario
    async register(data: RegisterUserDTO): Promise<UserResponseDTO> {
        // Verificar email existente
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }

        // Verificar username existente
        const existingUsername = await this.userRepository.findByUsername(data.username);
        if (existingUsername) {
            throw new Error('El nombre de usuario ya está en uso');
        }

        // Hashear contraseña
        const saltRounds = env.SALT_ROUNDS;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // Crear usuario
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
    async login(data: LoginUserDTO): Promise<AuthResponseDTO> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Credenciales inválidas');
        }

        // Generar JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );

        // Actualizar último visto
        await this.userRepository.updateLastSeen(user.id);

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        };
    }

    // * Obtener usuario por ID
    async findById(id: string): Promise<UserResponseDTO | null> {
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
    async update(userId: string, data: UpdateUserDTO): Promise<UpdateUserResponseDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const updatePayload: Partial<User> = {};

        // Validar y actualizar username
        if (data.username && data.username !== user.username) {
            const existing = await this.userRepository.findByUsername(data.username);
            if (existing) {
                throw new Error('El nombre de usuario ya está en uso');
            }
            updatePayload.username = data.username;
        }

        // Validar y actualizar email
        if (data.email && data.email !== user.email) {
            const existing = await this.userRepository.findByEmail(data.email);
            if (existing) {
                throw new Error('El email ya está registrado');
            }
            updatePayload.email = data.email;
        }

        // Cambiar contraseña
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

    // * Eliminar usuario
    async delete(userId: string): Promise<DeleteUserResponseDTO> {
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
}