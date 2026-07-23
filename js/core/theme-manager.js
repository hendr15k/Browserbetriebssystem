// js/core/theme-manager.js
/**
 * WebOS Theme & Appearance Manager
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.accentColor = '#007acc';
        this.themes = {
            light: {
                '--bg-color': '#f0f2f5',
                '--text-color': '#212529',
                '--taskbar-bg': '#ffffff',
                '--taskbar-text': '#212529',
                '--window-bg': '#ffffff',
                '--window-border': '#ced4da',
                '--accent-color': '#0078d7'
            },
            dark: {
                '--bg-color': '#121212',
                '--text-color': '#e0e0e0',
                '--taskbar-bg': '#1e1e1e',
                '--taskbar-text': '#ffffff',
                '--window-bg': '#242424',
                '--window-border': '#333333',
                '--accent-color': '#007acc'
            },
            'high-contrast': {
                '--bg-color': '#000000',
                '--text-color': '#ffffff',
                '--taskbar-bg': '#000000',
                '--taskbar-text': '#ffff00',
                '--window-bg': '#000000',
                '--window-border': '#ffffff',
                '--accent-color': '#ffff00'
            },
            solarized: {
                '--bg-color': '#fdf6e3',
                '--text-color': '#657b83',
                '--taskbar-bg': '#eee8d5',
                '--taskbar-text': '#586e75',
                '--window-bg': '#eee8d5',
                '--window-border': '#93a1a1',
                '--accent-color': '#2aa198'
            }
        };
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        this.currentTheme = themeName;
        const vars = this.themes[themeName];
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.setAttribute('data-theme', themeName);
            const root = document.documentElement;
            if (root.style && typeof root.style.setProperty === 'function') {
                for (const [key, value] of Object.entries(vars)) {
                    root.style.setProperty(key, value);
                }
            }
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('theme-changed', { theme: themeName });
        }
    }

    registerTheme(name, variables) {
        this.themes[name] = variables;
    }

    setAccentColor(color) {
        this.accentColor = color;
        if (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
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
