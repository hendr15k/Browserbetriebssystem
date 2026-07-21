// js/core/state-store.js
/**
 * WebOS State Store — Reactive state management with persistence.
 */
class StateStore {
    constructor() {
        this.state = {
            user: { username: 'user', hostname: 'webos', pin: null },
            theme: { color: '#0078d7', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
            startupApps: ['file-explorer', 'terminal'],
            settings: {}
        };
        this.load();
    }

    load() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem('webos-state');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.state = { ...this.state, ...parsed };
                }
            }
        } catch (e) {
            console.error('Failed to load stateStore', e);
        }
    }

    save() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('webos-state', JSON.stringify(this.state));
            }
            if (typeof window !== 'undefined' && window.WebOSEventBus) {
                window.WebOSEventBus.emit('state-changed', this.state);
            }
        } catch (e) {
            console.error('Failed to save stateStore', e);
        }
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.save();
    }
}

if (typeof window !== 'undefined') {
    window.WebOSState = new StateStore();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StateStore };
}
