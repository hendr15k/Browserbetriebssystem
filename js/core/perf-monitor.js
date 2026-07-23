// js/core/perf-monitor.js
/**
 * WebOS Performance Monitor — FPS, Memory, Long Tasks, Devtools Overlay.
 */
class PerfMonitor {
    constructor(options = {}) {
        this.isDev = options.isDev !== undefined ? options.isDev : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.search.includes('dev=true')));
        this.running = false;
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.longTasksCount = 0;
        this.callbacks = [];
        this.marks = new Map();
        this.measures = new Map();
        this.observer = null;
        this.rafId = null;
        this.overlayEl = null;
        this.metrics = { fps: 60, memory: null, longTasks: 0, frameTime: 16.6 };
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.longTasksCount = 0;

        const loop = (now) => {
            if (!this.running) return;
            this.frameCount++;
            const delta = now - this.lastTime;
            if (delta >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / delta);
                this.frameCount = 0;
                this.lastTime = now;
                this.updateMetrics();
            }
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);

        if (typeof PerformanceObserver !== 'undefined') {
            try {
                this.observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            this.longTasksCount++;
                            this.updateMetrics();
                        }
                    }
                });
                this.observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task observer not supported in all environments
            }
        }

        if (this.isDev && typeof document !== 'undefined') {
            this.createOverlay();
        }
    }

    stop() {
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.observer) this.observer.disconnect();
        if (this.overlayEl && this.overlayEl.parentNode) {
            this.overlayEl.parentNode.removeChild(this.overlayEl);
            this.overlayEl = null;
        }
    }

    updateMetrics() {
        let mem = null;
        if (typeof performance !== 'undefined' && performance.memory) {
            mem = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        this.metrics = {
            fps: this.fps,
            memory: mem,
            longTasks: this.longTasksCount,
            frameTime: this.fps > 0 ? Number((1000 / this.fps).toFixed(2)) : 0
        };

        this.callbacks.forEach(cb => {
            try { cb(this.metrics); } catch (e) { console.error('PerfMonitor callback error:', e); }
        });

        if (this.overlayEl) {
            this.updateOverlayUI();
        }
    }

    getMetrics() {
        this.updateMetrics();
        return this.metrics;
    }

    onMetric(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    mark(name) {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(name);
        }
        this.marks.set(name, performance.now());
    }

    measure(name, startMark, endMark) {
        let duration = 0;
        if (typeof performance !== 'undefined' && performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const entries = performance.getEntriesByName(name);
                if (entries.length > 0) {
                    duration = entries[entries.length - 1].duration;
                }
            } catch (e) {}
        }
        if (!duration && this.marks.has(startMark) && this.marks.has(endMark)) {
            duration = this.marks.get(endMark) - this.marks.get(startMark);
        }
        this.measures.set(name, duration);
        return duration;
    }

    getColor(fps, longTasks) {
        if (fps < 30 || longTasks > 5) return '#ff4d4f'; // red
        if (fps < 50 || longTasks > 0) return '#faad14'; // yellow
        return '#52c41a'; // green
    }

    createOverlay() {
        if (document.getElementById('webos-perf-overlay')) return;
        const div = document.createElement('div');
        div.id = 'webos-perf-overlay';
        div.style.cssText = 'position:fixed;bottom:10px;right:10px;background:rgba(0,0,0,0.8);color:#fff;padding:8px 12px;font-family:monospace;font-size:11px;z-index:999999;border-radius:4px;pointer-events:none;display:flex;gap:10px;align-items:center;border-left:4px solid #52c41a;';
        div.innerHTML = '<span id="perf-fps">FPS: 60</span><span id="perf-mem">MEM: -</span><span id="perf-lt">LT: 0</span>';
        document.body.appendChild(div);
        this.overlayEl = div;
    }

    updateOverlayUI() {
        if (!this.overlayEl) return;
        const fpsEl = this.overlayEl.querySelector('#perf-fps');
        const memEl = this.overlayEl.querySelector('#perf-mem');
        const ltEl = this.overlayEl.querySelector('#perf-lt');
        if (fpsEl) fpsEl.textContent = `FPS: ${this.metrics.fps}`;
        if (memEl && this.metrics.memory) {
            const mb = Math.round(this.metrics.memory.usedJSHeapSize / (1024 * 1024));
            memEl.textContent = `MEM: ${mb}MB`;
        }
        if (ltEl) ltEl.textContent = `LT: ${this.metrics.longTasks}`;
        const color = this.getColor(this.metrics.fps, this.metrics.longTasks);
        this.overlayEl.style.borderLeftColor = color;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSPerfMonitor = new PerfMonitor();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerfMonitor };
}
