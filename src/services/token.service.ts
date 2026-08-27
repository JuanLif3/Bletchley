import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { randomBytes } from 'crypto';

export class TokenService {
    private static refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

    // * Generar access token (corto plazo)
    static generateAccessToken(userId: string, email: string, username: string): string {
        return jwt.sign(
            { userId, email, username },
            env.JWT_SECRET as string,
            { expiresIn: '15m' as string }
        );
    }

    // * Generar refresh token (largo plazo)
    static generateRefreshToken(userId: string): string {
        const token = randomBytes(40).toString('hex');
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 días
        this.refreshTokens.set(token, { userId, expiresAt });
        return token;
    }

    // * Verificar refresh token
    static verifyRefreshToken(token: string): { userId: string } | null {
        const record = this.refreshTokens.get(token);
        if (!record) return null;
        if (Date.now() > record.expiresAt) {
            this.refreshTokens.delete(token);
            return null;
        }
        return { userId: record.userId };
    }

    // * Revocar refresh token
    static revokeRefreshToken(token: string): void {
        this.refreshTokens.delete(token);
    }

    // * Revocar todos los tokens de un usuario
    static revokeAllUserTokens(userId: string): void {
        for (const [token, record] of this.refreshTokens) {
            if (record.userId === userId) {
                this.refreshTokens.delete(token);
            }
        }
    }
}