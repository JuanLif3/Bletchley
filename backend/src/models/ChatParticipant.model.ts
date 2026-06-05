import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './Chat.model';
import { User } from './User.model';

@Entity('chat_participants')
export class ChatParticipant {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'chat_id', type: 'uuid' })
    chatId!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    joinedAt!: Date;

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt?: Date;

    @ManyToOne(() => Chat, (chat) => chat.participants)
    @JoinColumn({ name: 'chat_id' })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user.participantIn)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}