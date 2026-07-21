// js/core/theme-manager.js
/**
 * WebOS Theme & Appearance Manager
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.accentColor = '#007acc';
    }

    setTheme(themeName) {
        this.currentTheme = themeName;
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', themeName);
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('theme-changed', { theme: themeName });
        }
    }

    setAccentColor(color) {
        this.accentColor = color;
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--accent-color', color);
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('accent-changed', { color });
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSTheme = new ThemeManager();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager };
}
