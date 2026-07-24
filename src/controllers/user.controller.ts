import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { JWTUser } from '../types/jwt.types';
import {
    registerSchema,
    loginSchema,
    updateUserSchema,
    userIdParamSchema,
} from '../schemas/user.schema';
import {
    RegisterUserDto,
    LoginUserDto,
    UpdateUserDto,
} from '../dtos/user.dto';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // * Registrar usuario
    async register(request: FastifyRequest, reply: FastifyReply) {
        try {
            const validated = registerSchema.parse(request.body);

            const data: RegisterUserDto = {
                username: validated.username,
                email: validated.email,
                password: validated.password,
            };

            const result = await this.userService.register(data);

            return reply.status(201).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validación',
                    details: error.errors,
                });
            }

            if (error.message === 'El email ya está registrado' ||
                error.message === 'El nombre de usuario ya está en uso') {
                return reply.status(409).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en registro:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Login de usuario
    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const validated = loginSchema.parse(request.body);

            const data: LoginUserDto = {
                email: validated.email,
                password: validated.password,
            };

            const result = await this.userService.login(data);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validación',
                    details: error.errors,
                });
            }

            if (error.message === 'Credenciales inválidas') {
                return reply.status(401).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en login:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Obtener perfil propio
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            if (!userFromToken) {
                return reply.status(401).send({
                    success: false,
                    error: 'No autenticado',
                });
            }

            const user = await this.userService.findById(userFromToken.userId);

            if (!user) {
                return reply.status(404).send({
                    success: false,
                    error: 'Usuario no encontrado',
                });
            }

            return reply.status(200).send({
                success: true,
                data: user,
            });
        } catch (error: any) {
            console.error('Error en getProfile:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Actualizar perfil propio
    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            if (!userFromToken) {
                return reply.status(401).send({
                    success: false,
                    error: 'No autenticado',
                });
            }

            const validated = updateUserSchema.parse(request.body);

            const data: UpdateUserDto = {
                username: validated.username,
                email: validated.email,
                currentPassword: validated.currentPassword,
                newPassword: validated.newPassword,
            };

            const result = await this.userService.update(userFromToken.userId, data);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validación',
                    details: error.errors,
                });
            }

            if (error.message === 'El nombre de usuario ya está en uso' ||
                error.message === 'El email ya está registrado' ||
                error.message === 'La contraseña actual es incorrecta') {
                return reply.status(409).send({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message === 'Usuario no encontrado') {
                return reply.status(404).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en updateProfile:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Eliminar cuenta propia
    async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            if (!userFromToken) {
                return reply.status(401).send({
                    success: false,
                    error: 'No autenticado',
                });
            }

            const result = await this.userService.delete(userFromToken.userId);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.message === 'Usuario no encontrado') {
                return reply.status(404).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en deleteAccount:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}