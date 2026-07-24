import { z } from 'zod';

// * Esquema para crear chat individual
export const createChatSchema = z.object({
    participantId: z.string().uuid('ID de usuario inválido'),
});

// * Esquema para ID de chat (params)
export const chatIdParamSchema = z.object({
    chatId: z.string().uuid('ID de chat inválido'),
});

// * Tipos inferidos
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type ChatIdParam = z.infer<typeof chatIdParamSchema>;