import { JWTUser } from '../types/jwt.types';

declare module 'fastify' {
    export interface FastifyRequest {
        user?: JWTUser;
    }
}

export {};

declare global {
    namespace Fastify {
        interface Request {
            user?: any;
        }
    }
}