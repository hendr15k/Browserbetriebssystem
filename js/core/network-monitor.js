// js/core/network-monitor.js
class NetworkMonitor {
    constructor(options = {}) {
        this.online = typeof navigator !== 'undefined' && navigator.onLine !== undefined ? navigator.onLine : true;
        this.pingHost = options.pingHost || 'https://www.google.com/favicon.ico';
        this.pingIntervalMs = options.pingIntervalMs || 60000;
        this.pingTimer = null;
        this.latencies = new Map();
        this._initListeners();
        this._startPeriodicPing();
    }

    _initListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.online = true;
                this._trigger('network:online', { online: true });
            });
            window.addEventListener('offline', () => {
                this.online = false;
                this._trigger('network:offline', { online: false });
            });
        }
    }

    isOnline() {
        return this.online;
    }

    getConnectionType() {
        if (typeof navigator !== 'undefined' && navigator.connection) {
            return navigator.connection.effectiveType || navigator.connection.type || 'unknown';
        }
        return 'unknown';
    }

    getEffectiveBandwidth() {
        if (typeof navigator !== 'undefined' && navigator.connection) {
            return navigator.connection.downlink || 10; // Mbps
        }
        return 10;
    }

    async getLatency(host = this.pingHost) {
        const start = Date.now();
        try {
            if (typeof fetch !== 'undefined') {
                await fetch(host, { mode: 'no-cors', cache: 'no-store' });
            }
            const latency = Date.now() - start;
            this.latencies.set(host, latency);
            if (latency > 1000) {
                this._trigger('network:slow', { host, latency });
            }
            return latency;
        } catch (e) {
            const latency = Date.now() - start;
            this.latencies.set(host, latency);
            this._trigger('network:slow', { host, latency, error: e.message });
            return latency;
        }
    }

    _startPeriodicPing() {
        if (this.pingIntervalMs <= 0) return;
        this.pingTimer = setInterval(async () => {
            if (this.online) {
                const latency = await this.getLatency();
                if (latency > 2000) {
                    this._trigger('network:slow', { latency });
                }
            }
        }, this.pingIntervalMs);
    }

    stop() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    _trigger(event, data) {
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit(event, data);
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSNetworkMonitor = new NetworkMonitor();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NetworkMonitor };
}
