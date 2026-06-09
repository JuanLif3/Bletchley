import { FastifyInstance } from 'fastify';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { UserController } from '../../controllers/user.controller';

export async function userRoutes(fastify: FastifyInstance) {
    const userController = new UserController();

    // * Ruta protegida - Obtener perfil propio
    fastify.get('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.getProfile.bind(userController),
    });

    // * Actualizar perfil propio
    fastify.put('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.updateProfile.bind(userController),
    });

    // * Eliminar cuenta propia
    fastify.delete('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.deleteAccount.bind(userController),
    });

    // * Obtener usuario por ID (público limitado)
    fastify.get('/users/:id', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.getUserById.bind(userController),
    });
}