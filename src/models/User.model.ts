import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
    publicKey?: string;  // ⭐ AGREGAR ESTE CAMPO

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt!: Date;

    @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
    lastSeen?: Date;
}