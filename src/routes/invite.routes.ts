import { FastifyInstance } from 'fastify';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { InviteController } from '../controllers/invite.controller';

export async function inviteRoutes(fastify: FastifyInstance) {
    const inviteController = new InviteController();

    // * Generar link de invitación
    fastify.post('/invites', {
        preHandler: AuthMiddleware.verifyToken,
        handler: inviteController.createInvite.bind(inviteController),
    });

    // * Obtener mis invitaciones
    fastify.get('/invites', {
        preHandler: AuthMiddleware.verifyToken,
        handler: inviteController.getMyInvites.bind(inviteController),
    });

    // * Aceptar invitación (pública, pero requiere autenticación)
    fastify.post('/invites/:token/accept', {
        preHandler: AuthMiddleware.verifyToken,
        handler: inviteController.acceptInvite.bind(inviteController),
    });
}