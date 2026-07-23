(function(global) {
  'use strict';

  class NotificationCenter {
    constructor(options = {}) {
      this.eventBus = options.eventBus || (global.WebOS && global.WebOS.eventBus);
      this.storage = options.storage || null;
      this.storagePath = options.storagePath || '/home/user/notifications.json';
      this.notifications = [];
      this.maxVisible = options.maxVisible || 5;
      this.defaultDuration = options.defaultDuration || 5000;
      this.nextId = 1;
      this._loadPersisted();
    }

    _emit(type, payload) {
      if (this.eventBus && typeof this.eventBus.emit === 'function') {
        try { this.eventBus.emit(type, payload); } catch (e) {}
      }
    }

    _persist() {
      if (!this.storage || typeof this.storage.writeFile !== 'function') return;
      try {
        this.storage.writeFile(this.storagePath, JSON.stringify(this.notifications.slice(-200), null, 2));
      } catch (e) {}
    }

    _loadPersisted() {
      if (!this.storage || typeof this.storage.readFile !== 'function') return;
      try {
        const raw = this.storage.readFile(this.storagePath);
        if (!raw) return;
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.notifications = list;
          this.nextId = list.reduce((m, n) => Math.max(m, n.id || 0), 0) + 1;
        }
      } catch (e) {}
    }

    notify(input) {
      if (!input || typeof input !== 'object') return null;
      const n = {
        id: input.id || this.nextId++,
        title: String(input.title || ''),
        body: String(input.body || ''),
        icon: input.icon || null,
        app: String(input.app || 'system'),
        type: ['info', 'success', 'warning', 'error'].includes(input.type) ? input.type : 'info',
        duration: typeof input.duration === 'number' ? input.duration : this.defaultDuration,
        actions: Array.isArray(input.actions) ? input.actions.slice(0, 4) : [],
        timestamp: Date.now(),
        read: false
      };
      this.notifications.push(n);
      this._persist();
      this._emit('notification:new', n);
      return n;
    }

    dismiss(id) {
      const idx = this.notifications.findIndex(n => n.id === id);
      if (idx === -1) return false;
      const removed = this.notifications.splice(idx, 1)[0];
      this._persist();
      this._emit('notification:dismiss', removed);
      return true;
    }

    markRead(id) {
      const n = this.notifications.find(x => x.id === id);
      if (!n) return false;
      n.read = true;
      this._persist();
      this._emit('notification:read', n);
      return true;
    }

    clear(app) {
      const before = this.notifications.length;
      this.notifications = app ? this.notifications.filter(n => n.app !== app) : [];
      const removed = before - this.notifications.length;
      if (removed > 0) {
        this._persist();
        this._emit('notification:clear', { removed, app: app || null });
      }
      return removed;
    }

    getAll() { return this.notifications.slice(); }
    getUnread() { return this.notifications.filter(n => !n.read); }
    getByApp(app) { return this.notifications.filter(n => n.app === app); }
    getByType(type) { return this.notifications.filter(n => n.type === type); }
    getVisibleToasts() { return this.notifications.slice(-this.maxVisible); }

    groupByApp() {
      const groups = {};
      this.notifications.forEach(n => {
        if (!groups[n.app]) groups[n.app] = [];
        groups[n.app].push(n);
      });
      return groups;
    }

    requestBrowserPermission() {
      if (typeof Notification === 'undefined') return 'unsupported';
      try {
        if (Notification.permission === 'granted') return 'granted';
        if (Notification.permission === 'denied') return 'denied';
        Notification.requestPermission().then(p => this._emit('notification:permission', p));
        return Notification.permission;
      } catch (e) { return 'unsupported'; }
    }

    showBrowserNotification(notification) {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return null;
      try {
        const bn = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || undefined,
          tag: String(notification.id)
        });
        bn.onclick = () => this._emit('notification:click', notification);
        return bn;
      } catch (e) { return null; }
    }
  }

  const api = { NotificationCenter };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationCenter };
  }
  global.WebOSNotificationCenter = api;
  if (global.WebOS) global.WebOS.NotificationCenter = NotificationCenter;
  if (global.window) global.window.WebOSNotificationCenter = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));