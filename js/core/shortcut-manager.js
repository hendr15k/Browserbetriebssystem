// js/core/shortcut-manager.js
/**
 * WebOS Keyboard Shortcuts Manager
 */
class ShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (e) => this.handleKeydown(e));
        }
    }

    register(keyCombo, callback) {
        this.shortcuts.set(keyCombo.toLowerCase(), callback);
    }

    unregister(keyCombo) {
        this.shortcuts.delete(keyCombo.toLowerCase());
    }

    handleKeydown(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }

        const combo = parts.join('+');
        const cb = this.shortcuts.get(combo);
        if (cb) {
            e.preventDefault();
            cb(e);
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSShortcuts = new ShortcutManager();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShortcutManager };
}
