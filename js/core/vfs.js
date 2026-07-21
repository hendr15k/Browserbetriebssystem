// js/core/vfs.js
/**
 * WebOS IndexedDB Virtual File System (VFS) with OPFS fallback.
 */
class VirtualFileSystem {
    constructor() {
        this.dbName = 'WebOSVFS';
        this.storeName = 'files';
        this.db = null;
        this.memoryFallback = new Map();
    }

    async init() {
        if (typeof indexedDB === 'undefined') {
            console.warn('VFS: indexedDB not available, using memory fallback');
            return null;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = () => {
                console.warn('VFS: indexedDB error, using memory fallback');
                resolve(null);
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'path' });
                }
            };
        });
    }

    async writeFile(path, content, type = 'text') {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            this.memoryFallback.set(path, { content, type, updatedAt: new Date().toISOString() });
            return true;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const record = { path, content, type, updatedAt: new Date().toISOString() };
            const request = store.put(record);
            request.onsuccess = () => {
                if (typeof window !== 'undefined' && window.WebOSEventBus) window.WebOSEventBus.emit('vfs-changed', { action: 'write', path });
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async readFile(path) {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            const item = this.memoryFallback.get(path);
            return item ? item.content : null;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get(path);
            request.onsuccess = () => resolve(request.result ? request.result.content : null);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(path) {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            return this.memoryFallback.delete(path);
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.delete(path);
            request.onsuccess = () => {
                if (typeof window !== 'undefined' && window.WebOSEventBus) window.WebOSEventBus.emit('vfs-changed', { action: 'delete', path });
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async listFiles() {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            return Array.from(this.memoryFallback.keys());
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async listDir(dirPath) {
        const all = await this.listFiles();
        const normalized = dirPath.replace(/\/+$/, '') || '';
        return all.filter(p => {
            if (normalized === '') return true;
            return p.startsWith(normalized + '/') && p.indexOf('/', normalized.length + 1) === -1;
        });
    }

    async copyFile(srcPath, destPath) {
        const content = await this.readFile(srcPath);
        if (content === null) return false;
        return this.writeFile(destPath, content);
    }

    async moveFile(srcPath, destPath) {
        const content = await this.readFile(srcPath);
        if (content === null) return false;
        await this.writeFile(destPath, content);
        return this.deleteFile(srcPath);
    }

    async mkdir(dirPath) {
        const dirRecord = dirPath.replace(/\/+$/, '') || '/';
        return this.writeFile(dirRecord, '', 'directory');
    }

    async exists(path) {
        const all = await this.listFiles();
        return all.includes(path);
    }
}

if (typeof window !== 'undefined') {
    window.WebOSVFS = new VirtualFileSystem();
    window.WebOSVFS.init().catch(e => console.warn('VFS init fallback:', e));
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VirtualFileSystem };
}
