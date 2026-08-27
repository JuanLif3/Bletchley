import sodium from 'libsodium-wrappers';

class CryptoService {
    constructor() {
        this.initialized = false;
        this.keyPair = null;
    }

    // * Inicializar libsodium
    async init() {
        if (this.initialized) return;
        await sodium.ready;
        this.initialized = true;
        console.log('CryptoService inicializado');
    }

    // * Generar par de claves para un usuario
    generateKeyPair() {
        return sodium.crypto_box_keypair();
    }

    // * Obtener clave pública en base64
    getPublicKey(keypair) {
        return sodium.to_base64(keypair.publicKey);
    }

    // * Obtener clave privada en base64
    getPrivateKey(keypair) {
        return sodium.to_base64(keypair.privateKey);
    }

    // * Cifrar mensaje para un destinatario
    encryptMessage(message, senderPrivateKey, recipientPublicKey) {
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
    decryptMessage(ciphertext, nonce, recipientPrivateKey, senderPublicKey) {
        const decrypted = sodium.crypto_box_open_easy(
            sodium.from_base64(ciphertext),
            sodium.from_base64(nonce),
            senderPublicKey,
            recipientPrivateKey
        );
        return sodium.to_string(decrypted);
    }

    // * Generar clave a partir de contraseña (para el usuario)
    async generateKeysFromPassword(password) {
        const salt = sodium.from_string('BletchleySalt2024');
        const key = await sodium.crypto_pwhash(
            32, // tamaño de la clave
            sodium.from_string(password),
            salt,
            sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodium.crypto_pwhash_ALG_ARGON2ID13
        );
        return key;
    }

    // * Cifrar clave privada con contraseña
    encryptPrivateKey(privateKey, password) {
        const key = sodium.crypto_generichash(32, sodium.from_string(password));
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const encrypted = sodium.crypto_secretbox_easy(
            sodium.from_base64(privateKey),
            nonce,
            key
        );
        return {
            ciphertext: sodium.to_base64(encrypted),
            nonce: sodium.to_base64(nonce),
        };
    }

    // * Descifrar clave privada con contraseña
    decryptPrivateKey(encryptedPrivateKey, nonce, password) {
        const key = sodium.crypto_generichash(32, sodium.from_string(password));
        const decrypted = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(encryptedPrivateKey),
            sodium.from_base64(nonce),
            key
        );
        return sodium.to_base64(decrypted);
    }
}

export default new CryptoService();