import { DataSource } from 'typeorm';
import { User } from '../models/User.model';
import { Chat } from '../models/Chat.model';
import { ChatParticipant } from '../models/ChatParticipant.model';
import { Message } from '../models/Message.model';
import { Invite } from '../models/Invite.model';
import { Session } from '../models/Session.model';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'ep-lively-unit-ack60rpo-pooler.sa-east-1.aws.neon.tech',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'neondb_owner',
    password: process.env.DB_PASSWORD || 'npg_ifovkeM2VZ4A',
    database: process.env.DB_NAME || 'neondb',
    ssl: {
        rejectUnauthorized: false,
    },
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Chat, ChatParticipant, Message, Invite, Session],
    subscribers: [],
    migrations: [],
});