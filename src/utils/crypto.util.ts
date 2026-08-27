import sodium from 'libsodium-wrappers';

export class CryptoUtil {
    // * Inicializar libsodium
    static async init() {
        await sodium.ready;
    }

    // * Generar par de claves (pública/privada)
    static generateKeyPair() {
        return sodium.crypto_box_keypair();
    }

    // * Obtener clave pública en base64
    static getPublicKey(keypair: any): string {
        return sodium.to_base64(keypair.publicKey);
    }

    // * Obtener clave privada en base64
    static getPrivateKey(keypair: any): string {
        return sodium.to_base64(keypair.privateKey);
    }

    // * Cifrar mensaje para un destinatario
    static encryptMessage(
        message: string,
        senderPrivateKey: Uint8Array,
        recipientPublicKey: Uint8Array
    ): { ciphertext: string; nonce: string } {
        const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
        const encrypted = sodium.crypto_box_easy(
            sodium.from_string(message),
            nonce,
            recipientPublicKey,
            senderPrivateKey
        );
        return {
            ciphertext: sodium.to_base64(encrypted),
            nonce: sodium.to_base64(nonce),
        };
    }

    // * Descifrar mensaje
    static decryptMessage(
        ciphertext: string,
        nonce: string,
        recipientPrivateKey: Uint8Array,
        senderPublicKey: Uint8Array
    ): string {
        const decrypted = sodium.crypto_box_open_easy(
            sodium.from_base64(ciphertext),
            sodium.from_base64(nonce),
            senderPublicKey,
            recipientPrivateKey
        );
        return sodium.to_string(decrypted);
    }
}