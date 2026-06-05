import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './Message.model';
import { ChatParticipant } from './ChatParticipant.model';
import { Invite } from './Invite.model';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    username!: string;

    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar' })
    passwordHash!: string;

    @Column({ name: 'public_key', type: 'text', nullable: true })
    publicKey?: string;

    @Column({ name: 'is_ghost', type: 'boolean', default: false })
    isGhost!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt!: Date;

    @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
    lastSeen?: Date;

    @OneToMany(() => Message, (message) => message.sender)
    sentMessages!: Message[];

    @OneToMany(() => Message, (message) => message.receiver)
    receivedMessages!: Message[];

    @OneToMany(() => ChatParticipant, (participant) => participant.user)
    participantIn!: ChatParticipant[];

    @OneToMany(() => Invite, (invite) => invite.creator)
    invitesCreated!: Invite[];

    @OneToMany(() => Invite, (invite) => invite.usedBy)
    invitesUsed!: Invite[];
}