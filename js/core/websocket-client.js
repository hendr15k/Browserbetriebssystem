// js/core/websocket-client.js
class WebSocketClient {
    constructor(options = {}) {
        this.url = options.url || '';
        this.protocols = options.protocols;
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.backoffDelays = [1000, 2000, 4000, 8000, 16000, 30000];
        this.messageQueue = [];
        this.maxQueueSize = options.maxQueueSize || 100;
        this.heartbeatIntervalMs = options.heartbeatIntervalMs || 30000;
        this.heartbeatTimer = null;
        this.reconnectCounter = 0;
        this.subscriptions = new Set();
        this.listeners = {
            'ws:open': [],
            'ws:close': [],
            'ws:error': [],
            'ws:message': [],
            'ws:reconnect': []
        };
        this.isMock = options.isMock || false;
        this.mockHandler = options.mockHandler || null;
    }

    connect(url = this.url, protocols = this.protocols) {
        this.url = url;
        this.protocols = protocols;

        if (this.isMock || (typeof WebSocket === 'undefined')) {
            this.connected = true;
            this.reconnectAttempts = 0;
            this._trigger('ws:open', { url: this.url });
            this._startHeartbeat();
            return;
        }

        try {
            this.socket = new WebSocket(this.url, this.protocols);
            this.socket.onopen = (event) => {
                this.connected = true;
                this.reconnectAttempts = 0;
                this._startHeartbeat();
                this._flushQueue();
                this._trigger('ws:open', event);
            };
            this.socket.onclose = (event) => {
                this.connected = false;
                this._stopHeartbeat();
                this._trigger('ws:close', event);
                this._scheduleReconnect();
            };
            this.socket.onerror = (event) => {
                this._trigger('ws:error', event);
            };
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this._trigger('ws:message', data);
                    if (data && data.channel && this.subscriptions.has(data.channel)) {
                        this._trigger(`channel:${data.channel}`, data);
                    }
                } catch (e) {
                    this._trigger('ws:message', event.data);
                }
            };
        } catch (e) {
            this._trigger('ws:error', e);
            this._scheduleReconnect();
        }
    }

    send(type, data) {
        const payload = JSON.stringify({ type, data, timestamp: Date.now() });
        if (this.isMock) {
            if (this.mockHandler) {
                setTimeout(() => this.mockHandler(type, data, (resp) => this._trigger('ws:message', resp)), 10);
            } else {
                setTimeout(() => this._trigger('ws:message', { type: 'echo', data: { type, data } }), 10);
            }
            return true;
        }

        if (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(payload);
            return true;
        } else {
            if (this.messageQueue.length >= this.maxQueueSize) {
                this.messageQueue.shift();
            }
            this.messageQueue.push(payload);
            return false;
        }
    }

    close() {
        this._stopHeartbeat();
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
        this.reconnectAttempts = this.maxReconnectAttempts;
        if (this.socket && !this.isMock) {
            this.socket.close();
        }
        this.connected = false;
        this._trigger('ws:close', { code: 1000, reason: 'Client closed' });
    }

    on(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }

    off(type, callback) {
        if (!this.listeners[type]) return;
        this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }

    isConnected() {
        return this.connected;
    }

    subscribe(channel) {
        this.subscriptions.add(channel);
        this.send('subscribe', { channel });
    }

    unsubscribe(channel) {
        this.subscriptions.delete(channel);
        this.send('unsubscribe', { channel });
    }

    _trigger(type, data) {
        if (this.listeners[type]) {
            this.listeners[type].forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error(`WebSocketClient event error [${type}]:`, e);
                }
            });
        }
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit(type, data);
        }
    }

    _scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
        const delay = this.backoffDelays[Math.min(this.reconnectAttempts, this.backoffDelays.length - 1)];
        this.reconnectAttempts++;
        this.reconnectCounter++;
        this._trigger('ws:reconnect', { attempt: this.reconnectAttempts, delay, counter: this.reconnectCounter });
        this._reconnectTimer = setTimeout(() => {
            if (!this.connected) {
                this.connect();
            }
        }, delay);
    }

    _flushQueue() {
        while (this.messageQueue.length > 0 && this.connected) {
            const payload = this.messageQueue.shift();
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(payload);
            }
        }
    }

    _startHeartbeat() {
        this._stopHeartbeat();
        if (this.heartbeatIntervalMs <= 0) return;
        this.heartbeatTimer = setInterval(() => {
            if (this.connected) {
                this.send('ping', { t: Date.now() });
            }
        }, this.heartbeatIntervalMs);
    }

    _stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSWebSocketClient = WebSocketClient;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebSocketClient };
}
