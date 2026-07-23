// js/core/presence-service.js
/**
 * WebOS Presence Service — Real-time user status, cursor tracking, and awareness protocol.
 */
class PresenceService {
    constructor() {
        this.users = new Map(); // userId -> { info, status, cursor, selection, focus, lastSeen }
        this.subscribers = new Set();
        this.ttl = 60000; // 60s timeout
        this.timer = null;
        this._startHeartbeat();
    }

    _startHeartbeat() {
        if (typeof setInterval !== 'undefined') {
            this.timer = setInterval(() => {
                this._checkTTL();
            }, 10000);
        }
    }

    _checkTTL() {
        const now = Date.now();
        let changed = false;
        for (const [userId, user] of this.users.entries()) {
            if (user.status !== 'offline' && now - user.lastSeen > this.ttl) {
                user.status = 'offline';
                changed = true;
                this._emitEvent('presence:leave', { userId, user });
            }
        }
        if (changed) {
            this._emitEvent('presence:update', this.getOnlineUsers());
        }
    }

    _emitEvent(event, data) {
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit(event, data);
        }
        for (const cb of this.subscribers) {
            try { cb(event, data); } catch (e) { console.error('Presence subscriber error:', e); }
        }
    }

    setUser(userId, info) {
        const existing = this.users.get(userId) || { status: 'online', cursor: null, selection: null, focus: null };
        const updated = { ...existing, info, lastSeen: Date.now(), status: 'online' };
        this.users.set(userId, updated);
        this._emitEvent('presence:join', { userId, user: updated });
        this._emitEvent('presence:update', this.getOnlineUsers());
    }

    setStatus(userId, status) {
        const user = this.users.get(userId);
        if (user) {
            user.status = status;
            user.lastSeen = Date.now();
            this._emitEvent('presence:update', this.getOnlineUsers());
        }
    }

    updateCursor(userId, pos, selection = null, focus = null) {
        let user = this.users.get(userId);
        if (!user) {
            user = { info: { name: userId }, status: 'online' };
            this.users.set(userId, user);
        }
        user.cursor = pos;
        user.selection = selection;
        user.focus = focus;
        user.lastSeen = Date.now();
        this._emitEvent('presence:update', this.getOnlineUsers());
    }

    getOnlineUsers() {
        const result = {};
        for (const [userId, user] of this.users.entries()) {
            if (user.status !== 'offline') {
                result[userId] = { ...user };
            }
        }
        return result;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    broadcast(action, payload) {
        this._emitEvent(`presence:${action}`, payload);
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
        this.subscribers.clear();
        this.users.clear();
    }
}

if (typeof window !== 'undefined') {
    window.WebOSPresence = new PresenceService();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PresenceService };
}
