import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.model';
import { Chat } from './Chat.model';

@Entity('invites')
export class Invite {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    token!: string;

    @Column({ name: 'creator_id', type: 'uuid' })
    creatorId!: string;

    @Column({ name: 'target_user_id', type: 'uuid', nullable: true })
    targetUserId?: string;

    @Column({ name: 'chat_id', type: 'uuid', nullable: true })
    chatId?: string;

    @Column({ type: 'boolean', default: false })
    used!: boolean;

    @Column({ name: 'used_at', type: 'timestamp', nullable: true })
    usedAt?: Date;

    @Column({ name: 'used_by_id', type: 'uuid', nullable: true })
    usedById?: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt!: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator!: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'used_by_id' })
    usedBy?: User;

    @ManyToOne(() => Chat)
    @JoinColumn({ name: 'chat_id' })
    chat?: Chat;
}