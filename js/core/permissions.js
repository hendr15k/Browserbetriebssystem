// js/core/permissions.js
/**
 * WebOS Permission API — Granular permission management per app with VFS persistence.
 */
class PermissionManager {
    constructor() {
        this.permissions = new Map(); // appId -> Set of granted permissions
        this.pendingRequests = new Map(); // requestId -> { appId, permission, resolve, reject, timer }
        this.listeners = [];
        this.vfsPath = '/home/user/permissions.json';
        this.defaultTimeout = 30000; // 30 seconds auto-deny
        
        this.validPermissions = new Set([
            'camera', 'microphone', 'geolocation', 'notifications',
            'clipboard-read', 'clipboard-write', 'storage', 'network',
            'filesystem', 'camera-roll', 'contacts', 'bluetooth', 'usb'
        ]);

        this.hierarchy = {
            'camera': ['microphone'] // camera implies microphone support often or checked together
        };
    }

    async init(vfsInstance) {
        this.vfs = vfsInstance || (typeof window !== 'undefined' ? window.WebOSVFS : null);
        if (this.vfs) {
            try {
                const data = await this.vfs.readFile(this.vfsPath);
                if (data) {
                    const parsed = JSON.parse(data);
                    for (const [appId, perms] of Object.entries(parsed)) {
                        this.permissions.set(appId, new Set(perms));
                    }
                }
            } catch (e) {
                console.warn('PermissionManager: failed to load permissions from VFS', e);
            }
        }
    }

    async _persist() {
        if (!this.vfs) return;
        try {
            const obj = {};
            for (const [appId, perms] of this.permissions.entries()) {
                obj[appId] = Array.from(perms);
            }
            await this.vfs.writeFile(this.vfsPath, JSON.stringify(obj, null, 2));
        } catch (e) {
            console.warn('PermissionManager: failed to persist permissions', e);
        }
    }

    async request(appId, permission, timeoutMs = this.defaultTimeout) {
        if (!this.validPermissions.has(permission)) {
            throw new Error(`Invalid permission: ${permission}`);
        }

        if (this.check(appId, permission)) {
            return true;
        }

        const requestId = `${appId}:${permission}:${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                this._notifyListeners('permission:denied', { appId, permission, reason: 'timeout' });
                if (typeof window !== 'undefined' && window.WebOSEventBus) {
                    window.WebOSEventBus.emit('permission:denied', { appId, permission, reason: 'timeout' });
                }
                resolve(false);
            }, timeoutMs);

            this.pendingRequests.set(requestId, {
                requestId,
                appId,
                permission,
                resolve,
                reject,
                timer
            });

            this._notifyListeners('permission:requested', { requestId, appId, permission });
            if (typeof window !== 'undefined' && window.WebOSEventBus) {
                window.WebOSEventBus.emit('permission:requested', { requestId, appId, permission });
            }
        });
    }

    async grant(appId, permission) {
        if (!this.validPermissions.has(permission)) return false;

        if (!this.permissions.has(appId)) {
            this.permissions.set(appId, new Set());
        }
        this.permissions.get(appId).add(permission);

        // Handle hierarchy
        if (this.hierarchy[permission]) {
            for (const sub of this.hierarchy[permission]) {
                this.permissions.get(appId).add(sub);
            }
        }

        await this._persist();

        // Check pending requests for this appId + permission
        for (const [reqId, req] of this.pendingRequests.entries()) {
            if (req.appId === appId && req.permission === permission) {
                clearTimeout(req.timer);
                this.pendingRequests.delete(reqId);
                req.resolve(true);
            }
        }

        this._notifyListeners('permission:granted', { appId, permission });
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('permission:granted', { appId, permission });
        }
        return true;
    }

    async revoke(appId, permission) {
        if (this.permissions.has(appId)) {
            this.permissions.get(appId).delete(permission);
            await this._persist();
            this._notifyListeners('permission:revoked', { appId, permission });
            if (typeof window !== 'undefined' && window.WebOSEventBus) {
                window.WebOSEventBus.emit('permission:revoked', { appId, permission });
            }
            return true;
        }
        return false;
    }

    check(appId, permission) {
        if (!this.permissions.has(appId)) return false;
        return this.permissions.get(appId).has(permission);
    }

    getGrantedPermissions(appId) {
        if (!this.permissions.has(appId)) return [];
        return Array.from(this.permissions.get(appId));
    }

    getPendingRequests() {
        const list = [];
        for (const req of this.pendingRequests.values()) {
            list.push({
                requestId: req.requestId,
                appId: req.appId,
                permission: req.permission
            });
        }
        return list;
    }

    onPermissionChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    _notifyListeners(event, data) {
        for (const cb of this.listeners) {
            try {
                cb(event, data);
            } catch (e) {
                console.error('Error in permission listener:', e);
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSPermissions = { PermissionManager, instance: new PermissionManager() };
    if (window.WebOSVFS) {
        window.WebOSPermissions.instance.init(window.WebOSVFS);
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PermissionManager };
}
