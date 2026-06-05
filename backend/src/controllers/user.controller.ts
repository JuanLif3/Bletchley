import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { JWTUser } from '../types/jwt.types';

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
}