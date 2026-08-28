import sodium from 'libsodium-wrappers';

class CryptoService {
    constructor() {
        this.initialized = false;
        this.keyPair = null;
        this.cachedPrivateKey = null;
    }

    async init() {
        if (this.initialized) return;
        await sodium.ready;
        this.initialized = true;
        console.log('CryptoService inicializado');
    }

    setCachedPrivateKey(privateKey) {
        this.cachedPrivateKey = privateKey;
    }

    getCachedPrivateKey() {
        return this.cachedPrivateKey;
    }

    generateKeyPair() {
        return sodium.crypto_box_keypair();
    }

    getPublicKey(keypair) {
        return sodium.to_base64(keypair.publicKey);
    }

    getPrivateKey(keypair) {
        return sodium.to_base64(keypair.privateKey);
    }

    // Validar que una cadena sea Base64 válida
    isValidBase64(str) {
        try {
            sodium.from_base64(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    encryptMessage(message, senderPrivateKeyBase64, recipientPublicKeyBase64) {
        // Validar que las claves son Base64 correctas
        if (!this.isValidBase64(senderPrivateKeyBase64) || !this.isValidBase64(recipientPublicKeyBase64)) {
            throw new Error('Claves inválidas: se esperaba Base64');
        }

        const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
        const encrypted = sodium.crypto_box_easy(
            sodium.from_string(message),
            nonce,
            sodium.from_base64(recipientPublicKeyBase64),
            sodium.from_base64(senderPrivateKeyBase64)
        );
        return {
            ciphertext: sodium.to_base64(encrypted),
            nonce: sodium.to_base64(nonce),
        };
    }

    decryptMessage(ciphertextBase64, nonceBase64, recipientPrivateKeyBase64, senderPublicKeyBase64) {
        if (!this.isValidBase64(ciphertextBase64) || !this.isValidBase64(nonceBase64) ||
            !this.isValidBase64(recipientPrivateKeyBase64) || !this.isValidBase64(senderPublicKeyBase64)) {
            throw new Error('Datos inválidos: se esperaba Base64');
        }

        const decrypted = sodium.crypto_box_open_easy(
            sodium.from_base64(ciphertextBase64),
            sodium.from_base64(nonceBase64),
            sodium.from_base64(senderPublicKeyBase64),
            sodium.from_base64(recipientPrivateKeyBase64)
        );
        return sodium.to_string(decrypted);
    }

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