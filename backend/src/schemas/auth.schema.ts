import { z } from 'zod';

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guión bajo'),

    email: z
        .string()
        .email('Debe proporcionar un email válido (ejemplo: usuario@dominio.com)')
        .max(100, 'El email no puede exceder 100 caracteres'),

    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres'),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email('Debe proporcionar un email válido'),

    password: z
        .string()
        .min(1, 'La contraseña es requerida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;