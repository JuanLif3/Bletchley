import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Chat } from './Chat.model';
import { User } from './User.model';

@Entity('messages')
@Index(['chatId', 'createdAt'])
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'chat_id', type: 'uuid' })
    chatId!: string;

    @Column({ name: 'sender_id', type: 'uuid' })
    senderId!: string;

    @Column({ name: 'receiver_id', type: 'uuid', nullable: true })
    receiverId?: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'text' })
    nonce!: string;

    @Column({ type: 'boolean', default: true })
    encrypted!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt?: Date;

    @Column({ type: 'boolean', default: false })
    deleted!: boolean;

    @ManyToOne(() => Chat, (chat) => chat.messages)
    @JoinColumn({ name: 'chat_id' })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user.sentMessages)
    @JoinColumn({ name: 'sender_id' })
    sender!: User;

    @ManyToOne(() => User, (user) => user.receivedMessages)
    @JoinColumn({ name: 'receiver_id' })
    receiver?: User;
}