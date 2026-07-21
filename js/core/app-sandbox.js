// js/core/app-sandbox.js
/**
 * WebOS App Lifecycle & Sandboxing Manager
 */
class AppSandbox {
    constructor() {
        this.runningApps = new Map();
    }

    launch(appId, appConfig, containerEl) {
        if (this.runningApps.has(appId)) {
            const instance = this.runningApps.get(appId);
            if (instance.window && typeof instance.window.focus === 'function') {
                instance.window.focus();
            }
            return instance;
        }

        const sandboxInstance = {
            id: appId,
            config: appConfig,
            container: containerEl,
            startTime: Date.now(),
            status: 'running',
            terminate: () => {
                if (containerEl && containerEl.parentNode) {
                    containerEl.parentNode.removeChild(containerEl);
                }
                this.runningApps.delete(appId);
                if (typeof window !== 'undefined' && window.WebOSEventBus) {
                    window.WebOSEventBus.emit('app-terminated', { appId });
                }
            }
        };

        this.runningApps.set(appId, sandboxInstance);
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('app-launched', { appId });
        }
        return sandboxInstance;
    }

    get(appId) {
        return this.runningApps.get(appId);
    }

    terminate(appId) {
        const app = this.runningApps.get(appId);
        if (app) {
            app.terminate();
            return true;
        }
        return false;
    }

    listRunning() {
        return Array.from(this.runningApps.keys());
    }
}

if (typeof window !== 'undefined') {
    window.WebOSSandbox = new AppSandbox();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppSandbox };
}
