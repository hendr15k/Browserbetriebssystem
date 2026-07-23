// js/core/debug-console.js
/**
 * WebOS Debug Console — Developer REPL, WebOS API access, command history,
 * tab completion, variable inspection (:inspect), and multi-line support.
 */
class DebugConsole {
    constructor() {
        this.history = [];
        this.historyIndex = -1;
        this.context = {};
        this.eventBus = null;
        this.vfs = null;
        this.stateStore = null;
    }

    setDependencies(deps = {}) {
        this.eventBus = deps.eventBus || null;
        this.vfs = deps.vfs || null;
        this.stateStore = deps.stateStore || null;
        
        this.context.webos = {
            eventBus: this.eventBus,
            vfs: this.vfs,
            stateStore: this.stateStore
        };
    }

    eval(expression) {
        const trimmed = expression.trim();
        if (!trimmed) return '';

        this.history.push(trimmed);
        this.historyIndex = this.history.length;

        // Handle special commands
        if (trimmed.startsWith(':inspect ')) {
            const varName = trimmed.slice(9).trim();
            return this.inspectVariable(varName);
        }
        if (trimmed === ':help') {
            return 'Available commands: :inspect <var>, :help, :history, :clear; or any JS expression.';
        }
        if (trimmed === ':history') {
            return this.history.join('\n');
        }
        if (trimmed === ':clear') {
            this.history = [];
            this.historyIndex = 0;
            return 'History cleared.';
        }

        try {
            // Safe evaluation using Function or eval
            const keys = Object.keys(this.context);
            const values = Object.values(this.context);
            const fn = new Function(...keys, `try { return eval(${JSON.stringify(trimmed)}); } catch(e) { return e; }`);
            const res = fn(...values);
            return res;
        } catch (err) {
            return err;
        }
    }

    inspectVariable(varName) {
        try {
            const keys = Object.keys(this.context);
            const values = Object.values(this.context);
            const fn = new Function(...keys, `return ${varName};`);
            const val = fn(...values);
            return {
                name: varName,
                type: typeof val,
                value: val,
                details: val && typeof val === 'object' ? Object.getOwnPropertyNames(val) : null
            };
        } catch (err) {
            return `Error inspecting ${varName}: ${err.message}`;
        }
    }

    complete(input) {
        const globals = ['webos', 'window', 'document', 'console', 'JSON', 'Math', 'Date'];
        const matches = globals.filter(g => g.startsWith(input));
        return matches;
    }

    historyPrev() {
        if (this.history.length === 0) return '';
        if (this.historyIndex > 0) {
            this.historyIndex--;
        }
        return this.history[this.historyIndex] || '';
    }

    historyNext() {
        if (this.history.length === 0) return '';
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            return this.history[this.historyIndex];
        } else {
            this.historyIndex = this.history.length;
            return '';
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSDebugConsole = { DebugConsole, instance: new DebugConsole() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DebugConsole };
}
