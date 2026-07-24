import { FastifyInstance } from 'fastify';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';

export async function userRoutes(fastify: FastifyInstance) {
    const userController = new UserController();

    // * Rutas públicas
    fastify.post('/auth/register', userController.register.bind(userController));
    fastify.post('/auth/login', userController.login.bind(userController));

    // * Rutas protegidas
    fastify.get('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.getProfile.bind(userController),
    });

    fastify.put('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.updateProfile.bind(userController),
    });

    fastify.delete('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.deleteAccount.bind(userController),
    });
}