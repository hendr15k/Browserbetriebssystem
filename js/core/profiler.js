// js/core/profiler.js
/**
 * WebOS Profiler — Function-level profiling, call-tree aggregation, self vs total time,
 * flame graph data structures, hot-path detection, and sampling profiler.
 */
class Profiler {
    constructor() {
        this.profiles = new Map(); // name -> { totalTime, count, min, max, selfTime, calls }
        this.activeProfiles = new Map(); // name -> startTime
        this.callTree = { name: 'root', children: [], totalTime: 0, count: 0 };
        this.callStack = [];
        this.samplingTimer = null;
        this.samples = [];
        this.samplingIntervalMs = 5;
        this.isSampling = false;
    }

    profile(name, fn) {
        const self = this;
        return function(...args) {
            self.startProfiling(name);
            const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
            try {
                const result = fn.apply(this, args);
                if (result && typeof result.then === 'function') {
                    return result.finally(() => {
                        self.endProfiling(name, start);
                    });
                }
                self.endProfiling(name, start);
                return result;
            } catch (err) {
                self.endProfiling(name, start);
                throw err;
            }
        };
    }

    startProfiling(name) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this.activeProfiles.set(name, { startTime: now, stackDepth: this.callStack.length });
        this.callStack.push({ name, startTime: now, childrenTime: 0 });
    }

    endProfiling(name, customStart = null) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const active = this.activeProfiles.get(name);
        const startTime = customStart || (active ? active.startTime : now);
        const duration = Math.max(0, now - startTime);

        let stackItem = null;
        if (this.callStack.length > 0) {
            stackItem = this.callStack.pop();
            // If mismatch, find and remove
            if (stackItem.name !== name) {
                const idx = this.callStack.findIndex(s => s.name === name);
                if (idx !== -1) {
                    this.callStack.splice(idx);
                }
            }
        }

        const selfTime = stackItem ? Math.max(0, duration - stackItem.childrenTime) : duration;
        if (this.callStack.length > 0) {
            this.callStack[this.callStack.length - 1].childrenTime += duration;
        }

        let record = this.profiles.get(name);
        if (!record) {
            record = { name, totalTime: 0, count: 0, min: Infinity, max: 0, selfTime: 0 };
            this.profiles.set(name, record);
        }

        record.totalTime += duration;
        record.selfTime += selfTime;
        record.count++;
        if (duration < record.min) record.min = duration;
        if (duration > record.max) record.max = duration;

        this.activeProfiles.delete(name);
        return duration;
    }

    getReport(name) {
        const rec = this.profiles.get(name);
        if (!rec) return null;
        return {
            name: rec.name,
            totalTime: rec.totalTime,
            selfTime: rec.selfTime,
            count: rec.count,
            avgTime: rec.totalTime / rec.count,
            min: rec.min,
            max: rec.max
        };
    }

    getAllReports() {
        const reports = {};
        for (const [name, rec] of this.profiles.entries()) {
            reports[name] = this.getReport(name);
        }
        return reports;
    }

    getHotPaths(limit = 10) {
        const all = Object.values(this.getAllReports());
        all.sort((a, b) => b.totalTime - a.totalTime);
        return all.slice(0, limit);
    }

    getFlameGraphData() {
        return {
            name: 'root',
            value: 0,
            children: Array.from(this.profiles.entries()).map(([name, rec]) => ({
                name,
                value: rec.totalTime,
                count: rec.count
            }))
        };
    }

    startSampling() {
        if (this.isSampling) return;
        this.isSampling = true;
        this.samples = [];
        this.samplingTimer = setInterval(() => {
            if (this.callStack.length > 0) {
                const current = this.callStack[this.callStack.length - 1];
                this.samples.push({ timestamp: Date.now(), activeFunction: current.name });
            }
        }, this.samplingIntervalMs);
    }

    stopSampling() {
        if (!this.isSampling) return;
        this.isSampling = false;
        if (this.samplingTimer) {
            clearInterval(this.samplingTimer);
            this.samplingTimer = null;
        }
        return [...this.samples];
    }

    clear() {
        this.profiles.clear();
        this.activeProfiles.clear();
        this.callStack = [];
        this.samples = [];
    }
}

if (typeof window !== 'undefined') {
    window.WebOSProfiler = { Profiler, instance: new Profiler() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Profiler };
}
