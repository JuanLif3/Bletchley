import { FastifyRequest, FastifyReply } from 'fastify';
import { InviteService } from '../services/invite.service';
import { JWTUser } from '../types/jwt.types';

export class InviteController {
    private inviteService: InviteService;

    constructor() {
        this.inviteService = new InviteService();
    }

    // * Generar link de invitación
    async createInvite(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            const result = await this.inviteService.createInvite(userFromToken.userId);

            return reply.status(201).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error('Error en createInvite:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Aceptar invitación
    async acceptInvite(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;
            const { token } = request.params as { token: string };

            const result = await this.inviteService.acceptInvite(token, userFromToken.userId);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.message === 'Invitación no encontrada') {
                return reply.status(404).send({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message === 'La invitación ha expirado' ||
                error.message === 'La invitación ya ha sido usada' ||
                error.message === 'No puedes aceptar tu propia invitación') {
                return reply.status(400).send({
                    success: false,
                    error: error.message,
                });
            }

            console.error('Error en acceptInvite:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }

    // * Obtener mis invitaciones
    async getMyInvites(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userFromToken = request.user as JWTUser;

            const invites = await this.inviteService.getMyInvites(userFromToken.userId);

            return reply.status(200).send({
                success: true,
                data: invites,
            });
        } catch (error: any) {
            console.error('Error en getMyInvites:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}