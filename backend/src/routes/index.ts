import { FastifyInstance } from 'fastify';
import { authRoutes } from './v1/auth.routes';

export async function registerRoutes(fastify: FastifyInstance) {
    // Versión 1 de la API
    fastify.register(async (v1) => {
        await authRoutes(v1);
        // Aquí se agregarán más rutas en el futuro: chat, user, invite
    }, { prefix: '/api/v1' });
}