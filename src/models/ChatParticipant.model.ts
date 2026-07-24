import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
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

    @CreateDateColumn({ name: 'joined_at', type: 'timestamp' })
    joinedAt!: Date;

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt?: Date;

    @ManyToOne(() => Chat, (chat) => chat.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chat_id' })
    chat!: Chat;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;
}