import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User.model';
import { ChatParticipant } from './ChatParticipant.model';
import { Message } from './Message.model';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', nullable: true })
    name?: string;

    @Column({ name: 'is_group', type: 'boolean', default: false })
    isGroup!: boolean;

    @Column({ name: 'created_by', type: 'uuid' })
    createdBy!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator!: User;

    @OneToMany(() => ChatParticipant, (participant) => participant.chat)
    participants!: ChatParticipant[];

    @OneToMany(() => Message, (message) => message.chat)
    messages!: Message[];
}