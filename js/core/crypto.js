// js/core/crypto.js
/**
 * WebOS Crypto Helper — SubtleCrypto wrapper with fallback simple-xor encryption/hashing.
 */
class CryptoManager {
    constructor() {
        // Fallback salt / key
    }

    async hash(algorithm, data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
        
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                let alg = algorithm.toUpperCase();
                if (alg === 'SHA-256' || alg === 'SHA256') alg = { name: 'SHA-256' };
                const hashBuffer = await crypto.subtle.digest(alg, dataBuffer);
                return Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (e) {
                try {
                    const alg = algorithm.toUpperCase().replace('-', '');
                    const hashBuffer = await crypto.subtle.digest(alg, dataBuffer);
                    return Array.from(new Uint8Array(hashBuffer))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                } catch (err) {
                    // fall through
                }
            }
        }
        return this._fallbackXorHash(String(data));
    }

    _fallbackXorHash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h << 5) - h + str.charCodeAt(i);
            h |= 0;
        }
        return 'fallback_' + Math.abs(h).toString(16);
    }

    async hmac(algorithm, key, data) {
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key);
        const dataBuffer = encoder.encode(data);

        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const alg = algorithm.toUpperCase().replace('-', '');
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    keyBuffer,
                    { name: 'HMAC', hash: { name: alg } },
                    false,
                    ['sign']
                );
                const sig = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
                return Array.from(new Uint8Array(sig))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (e) {
                console.warn('CryptoManager: HMAC failed', e);
            }
        }
        return this._fallbackXorHash(key + data);
    }

    async generateKey(algorithm = { name: 'AES-GCM', length: 256 }, extractable = true, usages = ['encrypt', 'decrypt']) {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            return await crypto.subtle.generateKey(algorithm, extractable, usages);
        }
        return 'mock_key_' + Math.random();
    }

    async encrypt(data, passwordOrKey, salt = 'webos_salt') {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const key = await this._deriveKey(passwordOrKey, salt, ['encrypt']);
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const encoded = new TextEncoder().encode(text);
                const encrypted = await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    encoded
                );
                const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
                combined.set(iv, 0);
                combined.set(new Uint8Array(encrypted), iv.byteLength);
                return btoa(String.fromCharCode.apply(null, combined));
            } catch (e) {
                console.warn('CryptoManager: encrypt failed, fallback', e);
            }
        }
        return this._fallbackXorEncrypt(text, String(passwordOrKey));
    }

    async decrypt(encryptedBase64, passwordOrKey, salt = 'webos_salt') {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const key = await this._deriveKey(passwordOrKey, salt, ['decrypt']);
                const binary = atob(encryptedBase64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const iv = bytes.slice(0, 12);
                const data = bytes.slice(12);
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    data
                );
                return new TextDecoder().decode(decrypted);
            } catch (e) {
                console.warn('CryptoManager: decrypt failed, fallback', e);
            }
        }
        return this._fallbackXorDecrypt(encryptedBase64, String(passwordOrKey));
    }

    async _deriveKey(password, salt, usages) {
        const enc = new TextEncoder();
        const baseKey = await crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: enc.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            usages
        );
    }

    randomBytes(length = 32) {
        const array = new Uint8Array(length);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return array;
    }

    async passwordHash(password, salt = 'webos_password_salt') {
        return this.hash('SHA-256', password + salt);
    }

    _fallbackXorEncrypt(text, key) {
        let res = '';
        for (let i = 0; i < text.length; i++) {
            res += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(res);
    }

    _fallbackXorDecrypt(encoded, key) {
        const text = atob(encoded);
        let res = '';
        for (let i = 0; i < text.length; i++) {
            res += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return res;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSCrypto = { CryptoManager, instance: new CryptoManager() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CryptoManager };
}
