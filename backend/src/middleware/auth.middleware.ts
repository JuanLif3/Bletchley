import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { JWTUser } from '../types/jwt.types';

export class AuthMiddleware{
    static async verifyToken(
        request:FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction
    ) {
        try {

            // ! Obtener token del header Authorization
            const authHeader = request.headers.authorization;

            if (!authHeader) {
                return reply.status(401).send({
                    success: false,
                    error: 'Token no proporcionado',
                    message: 'Se requiere un token de autenticacion en el header authorization'
                });
            }

            // ! Verificar formato "Bearer <token>"
            const parts = authHeader.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                return reply.status(401).send({
                    success: false,
                    error: 'Formato de token inválido',
                    message: 'El token debe tener el formato: Bearer <token>'
                });
            }

            const token = parts[1];

            // ! Verificar y decodificar token
            const secret = env.JWT_SECRET as string;
            const decoded = jwt.verify(token, secret) as JWTUser;

            // ! Adjuntar usuario decodificado al request
            request.user = decoded;

            // ! Continuar con la ejecución
            done();

        } catch (error: any) {
            // ! Manejar errores específicos de JWT
            if (error.name === 'JsonWebTokenError') {
                return reply.status(401).send({
                    success: false,
                    error: 'Token inválido',
                    message: 'El token proporcionado no es válido'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return reply.status(401).send({
                    success: false,
                    error: 'Token expirado',
                    message: 'El token ha expirado, por favor inicie sesión nuevamente'
                });
            }

            // ! Error genérico
            console.error('Error en middleware de autenticación:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo verificar la autenticación'
            });
        }
    }

    // * opcional (no requiere autenticación, pero si hay token lo adjunta)
    static async optionalAuth(
        request: FastifyRequest,
        reply: FastifyReply,
        done: HookHandlerDoneFunction
    ) {
        try {
            const authHeader = request.headers.authorization;

            if (authHeader) {
                const parts = authHeader.split(' ');
                if (parts.length === 2 && parts[0] === 'Bearer') {
                    try {
                        const secret = env.JWT_SECRET as string;
                        const decoded = jwt.verify(parts[1], secret) as JWTUser;
                        request.user = decoded;
                    } catch (error) {
                        // ! Si el token es inválido, simplemente no adjuntamos usuario
                        // ! No lanzamos error porque es autenticación opcional
                    }
                }
            }

            done();
        } catch (error) {
            done();
        }
    }
}