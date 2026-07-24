import { z } from 'zod';

// * Esquema para registro
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exeder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guión bajo'),
    email: z
        .string()
        .email('Debe proporcionar un email valido'),
    password: z
        .string()
        .min(6, 'La contrase;a debe tener al menos 6 caracteres'),
});

// * Esquema para login
export const loginSchema = z.object({
    email: z
        .string()
        .email('Debe proporcionar un email válido'),
    password: z
        .string().min(1, 'La contraseña es requerida'),
})

// * Esquema para actualizar usuario
export const updateUserSchema = z.object({
    username: z
        .string()
        .min(30, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guión bajo')
        .optional(),
    email: z
        .string()
        .email('Debe proporcionar un email valido')
        .optional(),
    currentPassword: z
        .string()
        .min(1, 'La contraseña;a actual es requerida para cambios de contraseña')
        .optional(),
    newPassword: z
        .string()
        .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
        .optional(),
}).refine(
    (data) => {
        if (data.newPassword && !data.currentPassword) {
            return false;
        }
        return true;
    },
    {
        message: 'Para cambiar la contraseña, debe proporionar la contraseña actual',
        path:['currentPassword'],
    }
);

// * Esquema para ID de usuario (params)
export const userIdParamSchema = z.object({
    id: z.string().uuid('ID de usuario invalido'),
});

// * Tipos inferidos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;

