// js/core/error-boundary.js
/**
 * WebOS Error Boundary — Global error handler, unhandled promise rejections,
 * stack trace parsing, error categorization, log rotation, and event reporting.
 */
class ErrorBoundary {
    constructor() {
        this.log = [];
        this.maxLogSize = 500;
        this.installed = false;
        this.originalOnError = null;
        this.originalOnUnhandledRejection = null;
        this.originalConsoleError = null;
        this.eventBus = null;
    }

    setEventBus(bus) {
        this.eventBus = bus;
    }

    install() {
        if (this.installed) return;
        this.installed = true;

        if (typeof window !== 'undefined') {
            this.originalOnError = window.onerror;
            window.onerror = (message, source, lineno, colno, error) => {
                this.handleGlobalError(message, source, lineno, colno, error);
                if (typeof this.originalOnError === 'function') {
                    return this.originalOnError(message, source, lineno, colno, error);
                }
                return false;
            };

            this.originalOnUnhandledRejection = window.onunhandledrejection;
            window.addEventListener('unhandledrejection', this._handleRejection = (event) => {
                const reason = event.reason || {};
                this.report(reason, { type: 'unhandledrejection', source: 'promise' });
            });
        }

        if (typeof console !== 'undefined') {
            this.originalConsoleError = console.error;
            console.error = (...args) => {
                if (this.originalConsoleError) {
                    this.originalConsoleError.apply(console, args);
                }
                const msg = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
                this.report(new Error(msg), { type: 'console.error', source: 'console' });
            };
        }
    }

    uninstall() {
        if (!this.installed) return;
        this.installed = false;

        if (typeof window !== 'undefined') {
            if (this.originalOnError !== undefined) {
                window.onerror = this.originalOnError;
            }
            if (this._handleRejection) {
                window.removeEventListener('unhandledrejection', this._handleRejection);
            }
        }

        if (typeof console !== 'undefined' && this.originalConsoleError) {
            console.error = this.originalConsoleError;
        }
    }

    handleGlobalError(message, source, lineno, colno, error) {
        const errObj = error || new Error(message || 'Unknown global error');
        this.report(errObj, {
            source: source || 'unknown',
            lineno: lineno || 0,
            colno: colno || 0,
            type: 'runtime'
        });
    }

    wrap(fn, context = {}) {
        const self = this;
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (err) {
                self.report(err, { ...context, type: self.categorize(err) });
                throw err;
            }
        };
    }

    wrapAsync(fn, context = {}) {
        const self = this;
        return async function(...args) {
            try {
                return await fn.apply(this, args);
            } catch (err) {
                self.report(err, { ...context, type: self.categorize(err) });
                throw err;
            }
        };
    }

    report(error, context = {}) {
        const errObj = error instanceof Error ? error : new Error(String(error || 'Unknown error'));
        const category = context.type || this.categorize(errObj);
        const stackParsed = this.parseStackTrace(errObj.stack || '');

        const entry = {
            id: 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            message: errObj.message,
            name: errObj.name || 'Error',
            stack: errObj.stack || '',
            stackParsed,
            category,
            context
        };

        this.log.unshift(entry);
        if (this.log.length > this.maxLogSize) {
            this.log.pop();
        }

        if (this.eventBus) {
            this.eventBus.emit('error:caught', entry);
            this.eventBus.emit('error:reported', entry);
        }

        return entry;
    }

    categorize(error) {
        if (!error) return 'runtime';
        const msg = (error.message || '').toLowerCase();
        const name = (error.name || '').toLowerCase();

        if (name.includes('syntax') || msg.includes('syntaxerror') || msg.includes('unexpected token')) return 'syntax';
        if (msg.includes('network') || msg.includes('fetch') || msg.includes('http') || msg.includes('networkerror')) return 'network';
        if (msg.includes('permission') || msg.includes('denied') || msg.includes('unauthorized')) return 'permission';
        if (msg.includes('security') || msg.includes('cors') || msg.includes('csp')) return 'security';
        if (msg.includes('user') || contextHasUser(error)) return 'user';
        return 'runtime';
    }

    parseStackTrace(stack) {
        if (!stack) return [];
        const lines = stack.split('\n');
        const parsed = [];
        for (let line of lines) {
            line = line.trim();
            if (!line.startsWith('at ')) continue;
            // Example: at Object.eval [as fn] (file.js:10:15) or at file.js:10:15
            const match = line.match(/^at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+))\)?$/);
            if (match) {
                parsed.push({
                    functionName: match[1] || 'anonymous',
                    file: match[2] || '',
                    line: parseInt(match[3], 10) || 0,
                    column: parseInt(match[4], 10) || 0,
                    raw: line
                });
            } else {
                parsed.push({
                    functionName: 'anonymous',
                    file: '',
                    line: 0,
                    column: 0,
                    raw: line
                });
            }
        }
        return parsed;
    }

    decodeSourceMap(entry, sourceMap) {
        if (!sourceMap || !sourceMap.mappings || !entry.stackParsed) return entry;
        // Simplified mapping decoder stub
        return entry;
    }

    getLog() {
        return [...this.log];
    }

    clearLog() {
        this.log = [];
    }
}

function contextHasUser(err) {
    return false;
}

if (typeof window !== 'undefined') {
    window.WebOSErrorBoundary = { ErrorBoundary, instance: new ErrorBoundary() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorBoundary };
}
