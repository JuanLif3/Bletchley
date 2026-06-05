import { DataSource } from 'typeorm';
import { User } from '../models/User.model';
import { Chat } from '../models/Chat.model';
import { ChatParticipant } from '../models/ChatParticipant.model';
import { Message } from '../models/Message.model';
import { Invite } from '../models/Invite.model';
import { Session } from '../models/Session.model';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'ep-lively-unit-ack60rpo-pooler.sa-east-1.aws.neon.tech',
    port: 5432,
    username: 'neondb_owner',
    password: 'npg_PH4jENX9vAoG',
    database: 'neondb',
    ssl: {
        rejectUnauthorized: false,
    },
    synchronize: true,
    logging: true,
    entities: [User, Chat, ChatParticipant, Message, Invite, Session],
});