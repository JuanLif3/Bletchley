import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export class TOTPService {
    // * Generar secreto 2FA
    static generateSecret(email: string): { secret: string; otpauthUrl: string } {
        const secret = speakeasy.generateSecret({
            name: `Bletchley:${email}`,
            length: 20,
        });
        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url!,
        };
    }

    // * Generar QR para escanear con Google Authenticator
    static async generateQR(otpauthUrl: string): Promise<string> {
        return await qrcode.toDataURL(otpauthUrl);
    }

    // * Verificar código TOTP
    static verifyToken(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1,
        });
    }
}