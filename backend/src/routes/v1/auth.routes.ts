import { FastifyInstance } from 'fastify';
import { AuthController } from '../../controllers/auth.controller';

export async function authRoutes(fastity: FastifyInstance) {
    const authController = new AuthController();

    // * Registrar usuario
    fastity.post('/auth/register', {
        handler: authController.register.bind(authController),
    });

    // * Login de usuario
    fastity.post('/auth/login', {
        handler: authController.login.bind(authController),
    });
}