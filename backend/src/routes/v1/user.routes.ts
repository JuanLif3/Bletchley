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
}