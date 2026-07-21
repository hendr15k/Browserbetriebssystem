// js/core/event-bus.js
/**
 * WebOS Event Bus — Decoupled pub/sub for all system modules and apps.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(cb => {
            try {
                cb(data);
            } catch (e) {
                console.error(`Error in event listener for [${event}]:`, e);
            }
        });
    }
}

if (typeof window !== 'undefined') {
    window.WebOSEventBus = new EventBus();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus };
}
