import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import { env } from './config/env.config';
import { userRoutes } from './routes/user.routes';
import { messageRoutes } from './routes/message.routes';
import { ChatWebSocketHandler } from './websockets/chat.handler';


export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'development',
  });

  // * Plugins
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(helmet);
  await app.register(websocket);

  // * Registrar rutas
  await userRoutes(app);
  await messageRoutes(app);

  // * Registrar WebSocket
  const chatHandler = new ChatWebSocketHandler();
  app.get('/chat', { websocket: true }, async (socket, req) => {
    await chatHandler.handleConnection(app, socket, req);
  });

  // * Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}