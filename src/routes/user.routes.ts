import { FastifyInstance } from 'fastify';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { TokenController } from '../controllers/token.controller';

export async function userRoutes(fastify: FastifyInstance) {
    const userController = new UserController();
    const tokenController = new TokenController();

    // * Rutas públicas
    fastify.post('/auth/register', userController.register.bind(userController));
    fastify.post('/auth/login', userController.login.bind(userController));
    fastify.post('/auth/refresh', tokenController.refresh.bind(tokenController));

    // * Rutas protegidas
    fastify.get('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.getProfile.bind(userController),
    });

    fastify.post('/users/keys', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.savePublicKey.bind(userController),
    });

    fastify.get('/users/:userId/public-key', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.getPublicKey.bind(userController),
    });

    fastify.put('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.updateProfile.bind(userController),
    });

    fastify.delete('/users/me', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.deleteAccount.bind(userController),
    });

    // * Auto-destrucción
    fastify.delete('/users/self-destruct', {
        preHandler: AuthMiddleware.verifyToken,
        handler: userController.selfDestruct.bind(userController),
    });
}