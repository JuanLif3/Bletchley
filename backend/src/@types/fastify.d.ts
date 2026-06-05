import { JWTUser } from '../types/jwt.types';

declare module 'fastify' {
    interface FastifyRequest {
        user?: JWTUser;
    }
}