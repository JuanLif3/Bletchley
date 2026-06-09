import { z } from 'zod';

// * Esquema para actualizar usuario
export const updateUserSchema = z.object({
    username: z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guión bajo')
        .optional(),

    email: z
        .string()
        .email('Debe proporcionar un email valido')
        .max(100, 'El email no puede exceder 100 caracteres')
        .optional(),

    currentPassword: z
        .string()
        .min(1, 'La contraseña actual es requerida para cambios de contraseña')
        .optional(),

    newPassword: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres')
        .optional(),
}).refine(
    (data) => {
        // ! Si se proporciona newPassword, currentPassword es obligatorio
        if (data.newPassword && !data.currentPassword) {
            return false;
        }
        return  true;
    },
    {
        message: 'Para cambiar la contraseña, debe proporcionar la contraseña actual',
        path: ['currentPassword'],
    }
);

// * Esquema para obtener usuario por ID (param)
export const userIdParamSchema = z.object({
    id: z.string().uuid('ID de usuario inválido'),
});

// * Tipos inferidos
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
