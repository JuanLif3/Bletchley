import { z } from 'zod';

// * Esquema para enviar mensaje
export const sendMessageSchema = z.object({
    chatId: z.string().uuid('ID de chat invalido'),
    content: z
        .string()
        .min(1, 'El mensaje no puede estar vacio')
        .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
});

// * Esquemas para obtener mensajes
export const getMessagesSchema = z.object({
    chatId: z.string().uuid('ID de chat invalido'),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
});

// * Esquema para parametros
export const chatIdParamSchema = z.object({
    chatId: z.string().uuid('ID de chat invalido'),
});

// * Tipos
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type ChatIdParam = z.infer<typeof chatIdParamSchema>;