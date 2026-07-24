import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.model';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'chat_id', type: 'uuid' })
    chatId!: string;

    @Column({ name: 'sender_id', type: 'uuid' })
    senderId!: string;

    @Column({ type: 'text' })
    content!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    // * Relación con el usuario que envió el mensaje
    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender!: User;
}