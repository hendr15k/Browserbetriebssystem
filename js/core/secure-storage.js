// js/core/secure-storage.js
/**
 * WebOS Secure Storage — AES-encrypted key-value store backed by Virtual File System (VFS).
 */
class SecureStorage {
    constructor() {
        this.vfsPath = '/home/user/secure_store.enc';
        this.store = new Map();
        this.masterPassword = null;
        this.isUnlocked = false;
        this.inactivityTimeout = 15 * 60 * 1000; // 15 minutes default
        this.timer = null;
    }

    async init(masterPassword = 'default_secure_master_key', vfsInstance) {
        this.masterPassword = masterPassword;
        this.vfs = vfsInstance || (typeof window !== 'undefined' ? window.WebOSVFS : null);
        this.isUnlocked = true;
        this._resetTimer();

        if (this.vfs) {
            try {
                const data = await this.vfs.readFile(this.vfsPath);
                if (data) {
                    const cryptoMgr = typeof window !== 'undefined' && window.WebOSCrypto ? (window.WebOSCrypto.decrypt ? window.WebOSCrypto : window.WebOSCrypto.instance) : null;
                    const decrypted = cryptoMgr ? await cryptoMgr.decrypt(data, this.masterPassword) : data;
                    const parsed = JSON.parse(decrypted);
                    this.store = new Map(Object.entries(parsed));
                }
            } catch (e) {
                console.warn('SecureStorage: failed to load or decrypt store', e);
            }
        }
    }

    _resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        if (this.inactivityTimeout > 0) {
            this.timer = setTimeout(() => {
                this.lock();
            }, this.inactivityTimeout);
        }
    }

    lock() {
        this.isUnlocked = false;
        this.store.clear();
        if (this.timer) clearTimeout(this.timer);
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('secure-storage:locked', {});
        }
    }

    unlock(masterPassword) {
        if (this.masterPassword === masterPassword) {
            this.isUnlocked = true;
            this._resetTimer();
            return true;
        }
        return false;
    }

    async _persist() {
        if (!this.vfs || !this.isUnlocked) return;
        try {
            this._resetTimer();
            const obj = Object.fromEntries(this.store.entries());
            const json = JSON.stringify(obj);
            const cryptoMgr = typeof window !== 'undefined' && window.WebOSCrypto ? (window.WebOSCrypto.encrypt ? window.WebOSCrypto : window.WebOSCrypto.instance) : null;
            const encrypted = cryptoMgr ? await cryptoMgr.encrypt(json, this.masterPassword) : json;
            await this.vfs.writeFile(this.vfsPath, encrypted);
        } catch (e) {
            console.warn('SecureStorage: failed to persist store', e);
        }
    }

    async setItem(key, value) {
        if (!this.isUnlocked) throw new Error('SecureStorage is locked');
        this.store.set(key, value);
        await this._persist();
    }

    async getItem(key) {
        if (!this.isUnlocked) throw new Error('SecureStorage is locked');
        this._resetTimer();
        return this.store.get(key) !== undefined ? this.store.get(key) : null;
    }

    async removeItem(key) {
        if (!this.isUnlocked) throw new Error('SecureStorage is locked');
        const res = this.store.delete(key);
        await this._persist();
        return res;
    }

    async clear() {
        if (!this.isUnlocked) throw new Error('SecureStorage is locked');
        this.store.clear();
        await this._persist();
    }

    keys() {
        if (!this.isUnlocked) throw new Error('SecureStorage is locked');
        this._resetTimer();
        return Array.from(this.store.keys());
    }
}

if (typeof window !== 'undefined') {
    window.WebOSSecureStorage = { SecureStorage, instance: new SecureStorage() };
    if (window.WebOSVFS) {
        window.WebOSSecureStorage.instance.init('default_master_pw', window.WebOSVFS);
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecureStorage };
}
