// js/core/i18n.js
/**
 * WebOS Internationalization (i18n) Module
 */
class I18n {
    constructor() {
        this.currentLocale = 'de';
        this.fallbackLocale = 'en';
        this.availableLocales = ['de', 'en', 'fr', 'es'];
        this.translations = {
            en: {},
            de: {},
            fr: {},
            es: {}
        };
        this.loaded = false;
    }

    setTranslations(locale, data) {
        this.translations[locale] = data;
    }

    setLocale(locale) {
        if (!this.availableLocales.includes(locale)) return;
        this.currentLocale = locale;
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.setAttribute('lang', locale);
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('locale-changed', { locale });
        }
    }

    getLocale() {
        return this.currentLocale;
    }

    getAvailableLocales() {
        return [...this.availableLocales];
    }

    t(key, params = {}) {
        let translation = this._resolveKey(this.currentLocale, key);
        if (translation === undefined && this.currentLocale !== this.fallbackLocale) {
            translation = this._resolveKey(this.fallbackLocale, key);
        }
        if (translation === undefined) {
            return key;
        }
        return this._format(translation, params);
    }

    _resolveKey(locale, key) {
        const dict = this.translations[locale] || {};
        return dict[key];
    }

    _format(template, params) {
        if (typeof template !== 'string') return template;
        
        const pluralRegex = /\{(\w+),\s*plural,\s*one\{([^}]*)\}\s*other\{([^}]*)\}\}/g;
        template = template.replace(pluralRegex, (match, varName, oneStr, otherStr) => {
            const count = params[varName] !== undefined ? Number(params[varName]) : 0;
            const chosen = count === 1 ? oneStr : otherStr;
            return chosen.replace(/#/g, count);
        });

        return template.replace(/\{(\w+)\}/g, (match, p1) => {
            return params[p1] !== undefined ? params[p1] : match;
        });
    }

    async loadLocales() {
        if (typeof fetch !== 'undefined') {
            try {
                for (const loc of this.availableLocales) {
                    const res = await fetch(`locales/${loc}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        this.setTranslations(loc, data);
                    }
                }
                this.loaded = true;
            } catch (e) {
                console.warn('Failed to fetch locales via HTTP', e);
            }
        } else if (typeof require !== 'undefined') {
            try {
                const fs = require('fs');
                const path = require('path');
                for (const loc of this.availableLocales) {
                    const filePath = path.join(__dirname, '../../locales', `${loc}.json`);
                    if (fs.existsSync(filePath)) {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        this.setTranslations(loc, data);
                    }
                }
                this.loaded = true;
            } catch (e) {
                console.warn('Failed to load locales via fs', e);
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSI18n = new I18n();
    window.WebOSI18n.loadLocales();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n };
}
