import { randomBytes } from 'crypto';
import { InviteRepository } from '../repositories/invite.repository';
import { UserRepository } from '../repositories/user.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { InviteResponseDto, AcceptInviteResponseDto } from '../dtos/invite.dto';

export class InviteService {
    private inviteRepository: InviteRepository;
    private userRepository: UserRepository;
    private chatRepository: ChatRepository;

    constructor() {
        this.inviteRepository = new InviteRepository();
        this.userRepository = new UserRepository();
        this.chatRepository = new ChatRepository();
    }

    // * Generar link de invitación
    async createInvite(creatorId: string): Promise<InviteResponseDto> {
        const user = await this.userRepository.findById(creatorId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const token = randomBytes(16).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await this.inviteRepository.create({
            creatorId,
            token,
            expiresAt,
            used: false,
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const link = `${frontendUrl}/invite/${token}`;

        return {
            id: invite.id,
            token: invite.token,
            link,
            expiresAt: invite.expiresAt,
            createdAt: invite.createdAt,
            message: 'Link de invitación generado exitosamente',
        };
    }

    // * Aceptar invitación - VERSIÓN CORREGIDA
    async acceptInvite(token: string, userId: string): Promise<AcceptInviteResponseDto> {
        // 1. Buscar la invitación
        const invite = await this.inviteRepository.findByToken(token);
        if (!invite) {
            throw new Error('Invitación no encontrada');
        }

        // 2. Validar invitación
        if (invite.expiresAt < new Date()) {
            throw new Error('La invitación ha expirado');
        }

        if (invite.used) {
            throw new Error('La invitación ya ha sido usada');
        }

        if (invite.creatorId === userId) {
            throw new Error('No puedes aceptar tu propia invitación');
        }

        // 3. Verificar que los usuarios existen
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const creator = await this.userRepository.findById(invite.creatorId);
        if (!creator) {
            throw new Error('El usuario que te invitó ya no existe');
        }

        const existingChat = await this.chatRepository.findOneOnOneChat(userId, invite.creatorId);

        if (existingChat) {
            // Marcar la invitación como usada
            await this.inviteRepository.markAsUsed(token, userId);

            return {
                chatId: existingChat.id,
                message: 'Ya tienes un chat con este usuario',
            };
        }

        // 5. Crear nuevo chat (solo si no existe)
        const chat = await this.chatRepository.create({
            isGroup: false,
            createdById: invite.creatorId,
        });

        // 6. Agregar participantes
        await this.chatRepository.addParticipant(chat.id, invite.creatorId);
        await this.chatRepository.addParticipant(chat.id, userId);

        // 7. Marcar la invitación como usada
        await this.inviteRepository.markAsUsed(token, userId);

        return {
            chatId: chat.id,
            message: 'Chat creado exitosamente',
        };
    }

    private async findExistingChat(userId1: string, userId2: string): Promise<any | null> {
        // Obtener todos los chats del usuario 1
        const chats = await this.chatRepository.findByUserId(userId1);

        for (const chat of chats) {
            // Solo verificar chats individuales
            if (chat.isGroup) continue;

            // Obtener participantes del chat
            const participants = await this.chatRepository.getParticipants(chat.id);
            const participantIds = participants.map(p => p.userId);

            // Verificar que ambos usuarios estén en el chat
            if (participantIds.includes(userId1) && participantIds.includes(userId2)) {
                return chat;
            }
        }

        return null;
    }

    // * Obtener mis invitaciones
    async getMyInvites(userId: string): Promise<InviteResponseDto[]> {
        const invites = await this.inviteRepository.findByCreator(userId);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        return invites.map((invite) => ({
            id: invite.id,
            token: invite.token,
            link: `${frontendUrl}/invite/${invite.token}`,
            expiresAt: invite.expiresAt,
            createdAt: invite.createdAt,
            message: invite.used ? 'Ya fue usado' : 'Pendiente',
        }));
    }
}