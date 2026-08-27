import 'reflect-metadata';
import { buildApp } from './app';
import { AppDataSource } from './config/database.config';
import { env } from './config/env.config';
import { configureSecurityHeaders } from './config/security.config';
import { CryptoUtil } from './utils/crypto.util';
import { RateLimitMiddleware } from './middleware/rateLimit.middleware';

async function startServer() {
  try {

    // * Inicializar libsodium
    await CryptoUtil.init();
    console.log('Cifrado inicializado');

    // * Conectar base de datos
    await AppDataSource.initialize();
    console.log('Base de datos conectada a Neon');

    const app = await buildApp();

    // * Configurar Rate Limiting
    app.addHook('onRequest', RateLimitMiddleware.create({
      windowMs: 60 * 1000, // 1 minuto para prueba
      maxRequests: 100,    // 100 peticiones
      message: 'Demasiadas peticiones, intenta en 1 minuto',
    }));

    // * Configurar headers de seguridad
    configureSecurityHeaders(app);

    // Configurar rate limiting global (opcional)
    // app.addHook('onRequest', RateLimitMiddleware.create());

    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/health`);
    console.log(`Seguridad: 100% activa`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

startServer();
