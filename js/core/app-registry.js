// js/core/app-registry.js
/**
 * WebOS App Registry — ESM/CommonJS/Browser compatible registry for apps.
 */
/**
 * WebOS App Registry — ESM/CommonJS/Browser compatible registry for apps.
 */
class AppRegistry {
    constructor() {
        this.apps = new Map();
    }

    register(appId, appModule) {
        this.apps.set(appId, appModule);
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('app-registered', { appId });
        }
    }

    get(appId) {
        return this.apps.get(appId);
    }

    list() {
        return Array.from(this.apps.entries()).map(([id, mod]) => ({ id, ...mod }));
    }

    async launch(appId, options = {}) {
        let app = this.apps.get(appId);
        if (!app) {
            console.error(`AppRegistry: App not found: ${appId}`);
            return null;
        }
        const container = options.container || (typeof document !== 'undefined' ? document.createElement('div') : null);
        if (app.init && typeof app.init === 'function') {
            try {
                await app.init(container, options);
            } catch (e) {
                console.error(`AppRegistry: Error initializing app ${appId}:`, e);
            }
        }
        return container;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSAppRegistry = new AppRegistry();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppRegistry };
}
