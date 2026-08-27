import { FastifyRequest, FastifyReply } from 'fastify';
import { TokenService } from '../services/token.service';
import { UserRepository } from '../repositories/user.repository';

export class TokenController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    // * Renovar access token usando refresh token
    async refresh(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { refreshToken } = request.body as { refreshToken: string };

            if (!refreshToken) {
                return reply.status(400).send({
                    success: false,
                    error: 'Refresh token requerido',
                });
            }

            const result = TokenService.verifyRefreshToken(refreshToken);
            if (!result) {
                return reply.status(401).send({
                    success: false,
                    error: 'Refresh token inválido o expirado',
                });
            }

            // * Obtener usuario de la BD
            const user = await this.userRepository.findById(result.userId);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    error: 'Usuario no encontrado',
                });
            }

            const newAccessToken = TokenService.generateAccessToken(
                user.id,
                user.email,
                user.username
            );

            return reply.status(200).send({
                success: true,
                data: {
                    accessToken: newAccessToken,
                },
            });
        } catch (error) {
            console.error('Error en refresh:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Cerrar sesión (revocar refresh token)
    async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { refreshToken } = request.body as { refreshToken: string };

            if (refreshToken) {
                TokenService.revokeRefreshToken(refreshToken);
            }

            return reply.status(200).send({
                success: true,
                message: 'Sesión cerrada exitosamente',
            });
        } catch (error) {
            console.error('Error en logout:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}