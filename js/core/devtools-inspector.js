// js/core/devtools-inspector.js
/**
 * WebOS DevTools Inspector — DOM tree inspector, State inspector, Event listener viewer,
 * Console capture, Network log, and Snapshot export.
 */
class DevToolsInspector {
    constructor() {
        this.panelElement = null;
        this.visible = false;
        this.consoleLogs = [];
        this.networkLogs = [];
        this.originalConsole = {};
        this.originalFetch = null;
        this.originalXHR = null;
        this.eventBus = null;
        this.stateStore = null;
        this.vfs = null;
        this.appSandbox = null;
    }

    init(panelElement) {
        this.panelElement = panelElement || (typeof document !== 'undefined' ? document.createElement('div') : null);
        if (this.panelElement) {
            this.panelElement.id = 'webos-devtools-panel';
            this.panelElement.style.display = 'none';
        }
        this.captureConsole();
        this.captureNetwork();
    }

    setDependencies(deps = {}) {
        this.eventBus = deps.eventBus || null;
        this.stateStore = deps.stateStore || null;
        this.vfs = deps.vfs || null;
        this.appSandbox = deps.appSandbox || null;
    }

    show() {
        this.visible = true;
        if (this.panelElement) {
            this.panelElement.style.display = 'block';
        }
        if (this.eventBus) {
            this.eventBus.emit('devtools:show', {});
        }
    }

    hide() {
        this.visible = false;
        if (this.panelElement) {
            this.panelElement.style.display = 'none';
        }
        if (this.eventBus) {
            this.eventBus.emit('devtools:hide', {});
        }
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    inspect(target) {
        if (!target || target === 'dom' && typeof document !== 'undefined') {
            return this.inspectDOM(document.body || document.documentElement);
        }
        if (typeof target === 'string') {
            if (target === 'dom' && typeof document !== 'undefined') {
                return this.inspectDOM(document.body || document.documentElement);
            }
            if (target === 'state') {
                return this.inspectState();
            }
            if (target === 'network') {
                return [...this.networkLogs];
            }
            if (target === 'console') {
                return [...this.consoleLogs];
            }
        }
        return {
            target: typeof target,
            value: target
        };
    }

    inspectDOM(element = (typeof document !== 'undefined' ? document.body : null)) {
        if (!element) return null;
        const nodeInfo = {
            tagName: element.tagName || 'TEXT',
            id: element.id || '',
            className: element.className || '',
            attributes: {},
            children: []
        };
        if (element.attributes) {
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                nodeInfo.attributes[attr.name] = attr.value;
            }
        }
        if (element.children) {
            for (let i = 0; i < element.children.length; i++) {
                nodeInfo.children.push(this.inspectDOM(element.children[i]));
            }
        }
        return nodeInfo;
    }

    inspectState() {
        const state = {};
        if (this.stateStore && typeof this.stateStore.getAll === 'function') {
            Object.assign(state, this.stateStore.getAll());
        }
        if (this.appSandbox && typeof this.appSandbox.getRunningApps === 'function') {
            state.runningApps = this.appSandbox.getRunningApps();
        }
        return state;
    }

    captureConsole() {
        if (typeof console === 'undefined') return;
        ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
            this.originalConsole[method] = console[method];
            console[method] = (...args) => {
                this.consoleLogs.push({
                    level: method,
                    timestamp: Date.now(),
                    args: args.map(a => typeof a === 'object' ? JSON.parse(JSON.stringify(a, (k, v) => typeof v === 'function' ? '[Function]' : v)) : a)
                });
                if (this.consoleLogs.length > 1000) {
                    this.consoleLogs.shift();
                }
                this.originalConsole[method].apply(console, args);
            };
        });
    }

    captureNetwork() {
        if (typeof window !== 'undefined' && window.fetch) {
            this.originalFetch = window.fetch;
            window.fetch = async (input, init) => {
                const url = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
                const method = init && init.method ? init.method : 'GET';
                const startTime = Date.now();
                const logEntry = {
                    id: 'net_' + Math.random().toString(36).substr(2, 5),
                    type: 'fetch',
                    url,
                    method,
                    startTime,
                    status: 'pending'
                };
                this.networkLogs.push(logEntry);
                try {
                    const response = await this.originalFetch(input, init);
                    logEntry.status = response.status;
                    logEntry.duration = Date.now() - startTime;
                    return response;
                } catch (err) {
                    logEntry.status = 'error';
                    logEntry.error = err.message;
                    logEntry.duration = Date.now() - startTime;
                    throw err;
                }
            };
        }
    }

    exportSnapshot(format = 'json') {
        const snapshot = {
            timestamp: Date.now(),
            dom: this.inspectDOM(),
            state: this.inspectState(),
            consoleLogs: this.consoleLogs,
            networkLogs: this.networkLogs
        };
        if (format === 'html') {
            return `<!DOCTYPE html><html><head><title>WebOS DevTools Snapshot</title></head><body><pre>${JSON.stringify(snapshot, null, 2)}</pre></body></html>`;
        }
        return JSON.stringify(snapshot, null, 2);
    }
}

if (typeof window !== 'undefined') {
    window.WebOSDevTools = { DevToolsInspector, instance: new DevToolsInspector() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DevToolsInspector };
}
