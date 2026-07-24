import { FastifyRequest, FastifyReply } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { JWTUser } from '../types/jwt.types';

export class AuthMiddleware {
    static async verifyToken(request: FastifyRequest, reply: FastifyReply) {
        try {
            const authHeader = request.headers.authorization;

            if (!authHeader) {
                return reply.status(401).send({
                    success: false,
                    error: 'Token no proporcionado',
                    message: 'Se requiere un token de autenticación',
                });
            }

            const parts = authHeader.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                return reply.status(401).send({
                    success: false,
                    error: 'Formato de token inválido',
                    message: 'El token debe tener el formato: Bearer <token>',
                });
            }

            const token = parts[1];
            const decoded = jwt.verify(token, env.JWT_SECRET) as JWTUser;
            request.user = decoded;
        } catch (error: any) {
            if (error.name === 'JsonWebTokenError') {
                return reply.status(401).send({
                    success: false,
                    error: 'Token inválido',
                });
            }

            if (error.name === 'TokenExpiredError') {
                return reply.status(401).send({
                    success: false,
                    error: 'Token expirado',
                    message: 'Por favor inicie sesión nuevamente',
                });
            }

            console.error('Error en middleware:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}