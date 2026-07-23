(function(global) {
  'use strict';

  function fuzzyScore(query, target) {
    if (!query) return 0;
    const q = String(query).toLowerCase();
    const t = String(target).toLowerCase();
    if (t === q) return 1000;
    if (t.startsWith(q)) return 500 + (q.length / t.length) * 100;
    if (t.includes(q)) return 200 + (q.length / t.length) * 100;

    let qi = 0, score = 0, prevMatch = -2;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        const gap = ti - prevMatch;
        score += gap === 1 ? 30 : 10;
        prevMatch = ti;
        qi++;
      }
    }
    return qi === q.length ? score : 0;
  }

  class CommandPalette {
    constructor(options = {}) {
      this.eventBus = options.eventBus || (global.WebOS && global.WebOS.eventBus);
      this.storage = options.storage || null;
      this.storagePath = options.storagePath || '/home/user/recent-commands.json';
      this.commands = [];
      this.recent = [];
      this.maxRecent = 10;
      this.selectedIndex = 0;
      this.isOpen = false;
      this._loadRecent();
    }

    _emit(type, payload) {
      if (this.eventBus && typeof this.eventBus.emit === 'function') {
        try { this.eventBus.emit(type, payload); } catch (e) {}
      }
    }

    _persistRecent() {
      if (!this.storage || typeof this.storage.writeFile !== 'function') return;
      try { this.storage.writeFile(this.storagePath, JSON.stringify(this.recent, null, 2)); } catch (e) {}
    }

    _loadRecent() {
      if (!this.storage || typeof this.storage.readFile !== 'function') return;
      try {
        const raw = this.storage.readFile(this.storagePath);
        if (!raw) return;
        const list = JSON.parse(raw);
        if (Array.isArray(list)) this.recent = list.slice(0, this.maxRecent);
      } catch (e) {}
    }

    register(command) {
      if (!command || !command.id) return false;
      if (this.commands.find(c => c.id === command.id)) return false;
      this.commands.push({
        id: command.id,
        title: command.title || command.id,
        subtitle: command.subtitle || '',
        icon: command.icon || null,
        keywords: Array.isArray(command.keywords) ? command.keywords : [],
        category: command.category || 'general',
        handler: typeof command.handler === 'function' ? command.handler : null,
        shortcut: command.shortcut || null
      });
      this._emit('command:registered', command.id);
      return true;
    }

    unregister(id) {
      const idx = this.commands.findIndex(c => c.id === id);
      if (idx === -1) return false;
      this.commands.splice(idx, 1);
      return true;
    }

    list() { return this.commands.slice(); }

    search(query, limit = 20) {
      const q = (query || '').trim();
      if (!q) {
        const recents = this.recent.map(id => this.commands.find(c => c.id === id)).filter(Boolean);
        return recents.slice(0, limit);
      }
      const scored = [];
      for (const cmd of this.commands) {
        let score = fuzzyScore(q, cmd.title);
        if (cmd.subtitle) score += fuzzyScore(q, cmd.subtitle) * 0.5;
        for (const kw of cmd.keywords) score += fuzzyScore(q, kw) * 0.7;
        if (score > 0) scored.push({ command: cmd, score });
      }
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map(x => x.command);
    }

    execute(id) {
      const cmd = this.commands.find(c => c.id === id);
      if (!cmd) return false;
      this.recent = [id, ...this.recent.filter(x => x !== id)].slice(0, this.maxRecent);
      this._persistRecent();
      this._emit('command:execute', cmd);
      if (cmd.handler) {
        try { cmd.handler(); return true; } catch (e) { this._emit('command:error', { id, error: e.message }); return false; }
      }
      return true;
    }

    open() {
      this.isOpen = true;
      this.selectedIndex = 0;
      this._emit('palette:open', null);
    }
    close() {
      this.isOpen = false;
      this._emit('palette:close', null);
    }
    toggle() {
      if (this.isOpen) this.close(); else this.open();
      return this.isOpen;
    }

    moveSelection(delta) {
      const results = this.currentResults || [];
      if (results.length === 0) return null;
      this.selectedIndex = (this.selectedIndex + delta + results.length) % results.length;
      this._emit('palette:select', results[this.selectedIndex]);
      return results[this.selectedIndex];
    }

    confirmSelection() {
      const results = this.currentResults || [];
      if (results.length === 0 || !results[this.selectedIndex]) return false;
      return this.execute(results[this.selectedIndex].id);
    }

    setCurrentResults(results) { this.currentResults = results; this.selectedIndex = 0; }
    getRecent() { return this.recent.slice(); }
  }

  const api = { CommandPalette, fuzzyScore };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommandPalette, fuzzyScore };
  }
  global.WebOSCommandPalette = api;
  if (global.WebOS) {
    global.WebOS.CommandPalette = CommandPalette;
    global.WebOS.fuzzyScore = fuzzyScore;
  }
  if (global.window) {
    global.window.WebOSCommandPalette = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));