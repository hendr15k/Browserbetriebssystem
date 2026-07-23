// js/core/logger.js
/**
 * WebOS Logger — Structured logging system with levels (trace, debug, info, warn, error, fatal),
 * per-module loggers, sink system (console, memory, vfs), filtering, daily rotation, and event bus logging.
 */
class LoggerSystem {
    constructor() {
        this.levels = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 };
        this.minLevel = 'info';
        this.memorySink = [];
        this.maxMemoryEntries = 1000;
        this.vfs = null;
        this.eventLoggingEnabled = false;
        this.eventBus = null;
    }

    setMinLevel(level) {
        if (this.levels[level] !== undefined) {
            this.minLevel = level;
        }
    }

    setVFS(vfs) {
        this.vfs = vfs;
    }

    setEventBus(bus) {
        this.eventBus = bus;
        if (this.eventLoggingEnabled) {
            this.enableEventLogging();
        }
    }

    enableEventLogging() {
        this.eventLoggingEnabled = true;
        if (this.eventBus && typeof this.eventBus.on === 'function') {
            // Log all events emitted on bus
            const originalEmit = this.eventBus.emit;
            const self = this;
            // We hook by wrapping emit or listening to wildcard if supported.
            // Since eventBus has explicit listeners, we can listen or wrap emit:
            this.eventBus.emit = function(event, data) {
                if (event !== 'logger:entry' && !event.startsWith('error:')) {
                    self.info(`EventBus emitted [${event}]`, { event, data });
                }
                return originalEmit.call(this, event, data);
            };
        }
    }

    getLogger(moduleName) {
        const self = this;
        return {
            trace: (msg, meta) => self.log('trace', moduleName, msg, meta),
            debug: (msg, meta) => self.log('debug', moduleName, msg, meta),
            info: (msg, meta) => self.log('info', moduleName, msg, meta),
            warn: (msg, meta) => self.log('warn', moduleName, msg, meta),
            error: (msg, meta) => self.log('error', moduleName, msg, meta),
            fatal: (msg, meta) => self.log('fatal', moduleName, msg, meta)
        };
    }

    log(level, moduleName, message, meta = {}) {
        if (this.levels[level] < this.levels[this.minLevel]) return;

        const entry = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            level,
            module: moduleName || 'global',
            message,
            meta
        };

        this.memorySink.push(entry);
        if (this.memorySink.length > this.maxMemoryEntries) {
            this.memorySink.shift();
        }

        // Console Sink
        const consoleFn = console[level] || console.log;
        if (consoleFn) {
            consoleFn(`[${new Date(entry.timestamp).toISOString()}] [${level.toUpperCase()}] [${entry.module}]: ${message}`, meta);
        }

        // VFS Sink async save (non-blocking)
        if (this.vfs && typeof this.vfs.writeFile === 'function') {
            const dateStr = new Date().toISOString().slice(0, 10);
            const path = `/home/user/logs/${dateStr}.json`;
            // Batch or write
            this._writeVFSSink(path, entry).catch(() => {});
        }

        if (this.eventBus && typeof this.eventBus.emit === 'function' && level !== 'trace') {
            this.eventBus.emit('logger:entry', entry);
        }

        return entry;
    }

    async _writeVFSSink(path, entry) {
        try {
            let existing = [];
            try {
                const content = await this.vfs.readFile(path);
                existing = JSON.parse(content);
            } catch (e) {
                // file might not exist yet
            }
            existing.push(entry);
            await this.vfs.writeFile(path, JSON.stringify(existing, null, 2));
        } catch (e) {
            // ignore VFS errors to prevent recursion
        }
    }

    getEntries(filter = {}) {
        let entries = [...this.memorySink];

        if (filter.level) {
            const targetRank = this.levels[filter.level] || 0;
            entries = entries.filter(e => this.levels[e.level] >= targetRank);
        }
        if (filter.module) {
            entries = entries.filter(e => e.module === filter.module);
        }
        if (filter.since) {
            entries = entries.filter(e => e.timestamp >= filter.since);
        }
        if (filter.until) {
            entries = entries.filter(e => e.timestamp <= filter.until);
        }
        if (filter.contains) {
            const q = String(filter.contains).toLowerCase();
            entries = entries.filter(e => e.message.toLowerCase().includes(q) || e.module.toLowerCase().includes(q));
        }

        return entries;
    }

    clear() {
        this.memorySink = [];
    }
}

if (typeof window !== 'undefined') {
    window.WebOSLogger = { LoggerSystem, instance: new LoggerSystem() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoggerSystem, getLogger: (mod) => window.WebOSLogger ? window.WebOSLogger.getLogger(mod) : new LoggerSystem().getLogger(mod) };
}
