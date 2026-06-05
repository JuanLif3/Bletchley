import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import { fastifyConfig } from './config/fastify.config';
import { env } from './config/env.config';
import { registerRoutes } from './routes';

export async function buildApp() {
    const app = Fastify(fastifyConfig);

    // Registrar plugins
    await app.register(cors, {
        origin: env.CORS_ORIGIN,
        credentials: true,
    });

    await app.register(helmet);
    await app.register(websocket);

    // Registrar rutas de la API
    await registerRoutes(app);

    // Health check
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Ruta raíz
    app.get('/', async () => {
        return {
            name: 'Bletchley Chat API',
            version: '1.0.0',
            status: 'running'
        };
    });

    return app;
}