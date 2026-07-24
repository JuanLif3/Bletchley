import 'reflect-metadata';
import { buildApp } from './app';
import { AppDataSource } from './config/database.config';
import { env } from './config/env.config';

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada a Neon');

    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/health`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

startServer();
