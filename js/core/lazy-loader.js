// js/core/lazy-loader.js
/**
 * WebOS Lazy Loader for Apps & Modules
 */
class LazyLoader {
    constructor() {
        this.loadedModules = new Map();
    }

    async loadModule(path) {
        if (this.loadedModules.has(path)) {
            return this.loadedModules.get(path);
        }
        try {
            const mod = await import(path);
            this.loadedModules.set(path, mod);
            return mod;
        } catch (e) {
            console.error(`Failed to lazy load module: ${path}`, e);
            return null;
        }
    }

    async loadApp(appConfig) {
        if (appConfig.modulePath) {
            return await this.loadModule(appConfig.modulePath);
        }
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSLazyLoader = new LazyLoader();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LazyLoader };
}
