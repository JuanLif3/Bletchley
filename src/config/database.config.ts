import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env.config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: env.NODE_ENV === 'development',
  entities: [],
});
