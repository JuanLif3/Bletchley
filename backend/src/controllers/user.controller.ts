import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { JWTUser } from '../types/jwt.types';
import { updateUserSchema, userIdParamSchema } from '../schemas/user.schema';
import { UpdateUserRequestDTO } from '../dtos/user.dto';

export class UserController{
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        try {

            // ! Obtener usuario del middleware
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
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isGhost: user.isGhost,
                    createdAt: user.createdAt,
                },
            });

        } catch (error: any) {
            console.error('Error en getProfile:', error);
            return reply.status(500).send({
                success: false,
                errror: 'Error interno del servidor',
            });
        }
    }

    async getUserById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const params = userIdParamSchema.parse(request.params);
            const userFromToken = request.user as JWTUser;

            const user = await this.userService.findByIdWithDetails(params.id);

            if (!user) {
                return reply.status(404).send({
                    success: false,
                    error: 'Usuario no encontrado',
                });
            }

            // ! No mostrar email si es otro usuario
            const response = {
                id: user.id,
                username: user.username,
                isGhost: user.isGhost,
                createdAt: user.createdAt,
                ...(userFromToken.userId === params.id && { email: user.email }), // ! Solo mostrar el email si es el propio perfil
            };

            return reply.status(200).send({
                success: true,
                data: response,
            });
        } catch (error: any) {
            if(error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validacion',
                    details: error.errors,
                });
            }
            console.error('Error en obtener el id de usuario', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            if(!userFromToken) {
                return reply.status(401).send({
                    success: false,
                    error: 'No autenticado',
                });
            }

            const validatedData = updateUserSchema.parse(request.body);

            const updateData: UpdateUserRequestDTO = {
                username: validatedData.username,
                email: validatedData.email,
                currentPassword: validatedData.currentPassword,
                newPassword: validatedData.newPassword,
            };

            const result = await this.userService.updateUser(userFromToken.userId, updateData);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validacion',
                    details: error.errors,
                });
            }

            // ! Errores de negocio
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

    async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            if (!userFromToken) {
                return reply.status(401).send({
                    success: false,
                    error: 'No autenticado',
                });
            }

            const result = await this.userService.deleteUser(userFromToken.userId);

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