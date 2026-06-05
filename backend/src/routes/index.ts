import { FastifyInstance } from 'fastify';
import { authRoutes } from './v1/auth.routes';
import { userRoutes } from './v1/user.routes';

export async function registerRoutes(fastify: FastifyInstance) {
    // * Versión 1 de la API
    fastify.register(async (v1) => {
        // * Rutas públicas (no requieren autenticación)
        await authRoutes(v1);

        // * Rutas protegidas (requieren autenticación)
        await userRoutes(v1);

        // Aquí se agregarán más rutas protegidas:
        // await chatRoutes(v1);
        // await messageRoutes(v1);
        // await inviteRoutes(v1);
    }, { prefix: '/api/v1' });
}