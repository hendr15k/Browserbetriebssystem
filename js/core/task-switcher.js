(function(global) {
  'use strict';

  class TaskSwitcher {
    constructor(options = {}) {
      this.eventBus = options.eventBus || (global.WebOS && global.WebOS.eventBus);
      this.windows = [];
      this.activeIndex = -1;
      this.enabled = true;
      this.overlayVisible = false;
    }

    _emit(type, payload) {
      if (this.eventBus && typeof this.eventBus.emit === 'function') {
        try { this.eventBus.emit(type, payload); } catch (e) {}
      }
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
    toggle() { this.enabled = !this.enabled; return this.enabled; }

    registerWindow(win) {
      if (!win || !win.id) return false;
      if (this.windows.find(w => w.id === win.id)) return false;
      this.windows.push({
        id: win.id,
        title: win.title || 'Untitled',
        icon: win.icon || null,
        thumbnail: win.thumbnail || null,
        timestamp: Date.now()
      });
      if (this.activeIndex === -1) this.activeIndex = this.windows.length - 1;
      this._emit('task:registered', win);
      return true;
    }

    unregisterWindow(id) {
      const idx = this.windows.findIndex(w => w.id === id);
      if (idx === -1) return false;
      this.windows.splice(idx, 1);
      if (this.activeIndex >= this.windows.length) {
        this.activeIndex = this.windows.length - 1;
      }
      if (this.activeIndex < 0 && this.windows.length > 0) this.activeIndex = 0;
      this._emit('task:unregistered', { id });
      return true;
    }

    updateWindow(id, updates) {
      const w = this.windows.find(x => x.id === id);
      if (!w) return false;
      Object.assign(w, updates || {});
      this._emit('task:updated', w);
      return true;
    }

    listWindows() { return this.windows.slice(); }
    getActive() {
      return this.activeIndex >= 0 && this.activeIndex < this.windows.length
        ? this.windows[this.activeIndex] : null;
    }
    getWindow(id) { return this.windows.find(w => w.id === id) || null; }

    next() {
      if (this.windows.length === 0) return null;
      this.activeIndex = (this.activeIndex + 1) % this.windows.length;
      const win = this.windows[this.activeIndex];
      this._emit('task:switch', { window: win, direction: 'next' });
      return win;
    }

    prev() {
      if (this.windows.length === 0) return null;
      this.activeIndex = this.activeIndex <= 0
        ? this.windows.length - 1
        : this.activeIndex - 1;
      const win = this.windows[this.activeIndex];
      this._emit('task:switch', { window: win, direction: 'prev' });
      return win;
    }

    activate(id) {
      const idx = this.windows.findIndex(w => w.id === id);
      if (idx === -1) return null;
      this.activeIndex = idx;
      const win = this.windows[idx];
      this._emit('task:switch', { window: win, direction: 'direct' });
      return win;
    }

    showOverlay() { this.overlayVisible = true; this._emit('overlay:show', this.windows); }
    hideOverlay() { this.overlayVisible = false; this._emit('overlay:hide', null); }
    toggleOverlay() {
      if (this.overlayVisible) this.hideOverlay(); else this.showOverlay();
      return this.overlayVisible;
    }

    handleKey(event) {
      if (!this.enabled || !event) return false;
      const alt = event.altKey;
      const meta = event.metaKey || event.ctrlKey;
      if (!alt && !meta) return false;

      if (event.key === 'Tab' && (alt || meta)) {
        event.preventDefault();
        if (event.shiftKey) this.prev(); else this.next();
        return true;
      }

      if (event.key === 'Meta' || event.key === 'OS' || (meta && event.key === ' ')) {
        event.preventDefault();
        this.showOverlay();
        return true;
      }
      return false;
    }
  }

  const api = { TaskSwitcher };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskSwitcher };
  }
  global.WebOSTaskSwitcher = api;
  if (global.WebOS) global.WebOS.TaskSwitcher = TaskSwitcher;
  if (global.window) global.window.WebOSTaskSwitcher = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));