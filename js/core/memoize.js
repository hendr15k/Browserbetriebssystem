// js/core/memoize.js
/**
 * WebOS Memoization, Debounce, Throttle, IdleCallback & Batch Updates.
 */

// 1. Memoize with WeakMap/Map & LRU strategy
function memoize(fn, options = {}) {
    const maxCacheSize = options.maxSize || 1000;
    const cache = new Map();
    const weakCache = new WeakMap();

    return function(...args) {
        if (args.length === 1 && args[0] !== null && (typeof args[0] === 'object' || typeof args[0] === 'function')) {
            const obj = args[0];
            if (weakCache.has(obj)) {
                return weakCache.get(obj);
            }
            const result = fn.apply(this, args);
            weakCache.set(obj, result);
            return result;
        }

        const key = JSON.stringify(args);
        if (cache.has(key)) {
            // LRU touch: delete and re-set
            const val = cache.get(key);
            cache.delete(key);
            cache.set(key, val);
            return val;
        }

        const result = fn.apply(this, args);
        if (cache.size >= maxCacheSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(key, result);
        return result;
    };
}

// 2. Debounce & Throttle
function debounceAsync(fn, ms) {
    let timer = null;
    let pendingReject = null;
    return function(...args) {
        if (timer) clearTimeout(timer);
        if (pendingReject) {
            pendingReject(new Error('debounced'));
            pendingReject = null;
        }
        return new Promise((resolve, reject) => {
            pendingReject = reject;
            timer = setTimeout(async () => {
                pendingReject = null;
                try {
                    const res = await fn.apply(this, args);
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }, ms);
        });
    };
}

function throttle(fn, limit) {
    let lastCall = 0;
    let lastTimeout = null;
    return function(...args) {
        const now = Date.now();
        const remaining = limit - (now - lastCall);
        if (remaining <= 0) {
            if (lastTimeout) {
                clearTimeout(lastTimeout);
                lastTimeout = null;
            }
            lastCall = now;
            return fn.apply(this, args);
        } else if (!lastTimeout) {
            lastTimeout = setTimeout(() => {
                lastCall = Date.now();
                lastTimeout = null;
                fn.apply(this, args);
            }, remaining);
        }
    };
}

// 3. requestIdleCallback Wrapper with Polyfill
const requestIdleCallbackWrapper = (typeof window !== 'undefined' && window.requestIdleCallback) || function(cb) {
    const start = Date.now();
    return setTimeout(() => {
        cb({
            didTimeout: false,
            timeRemaining() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};

const cancelIdleCallbackWrapper = (typeof window !== 'undefined' && window.cancelIdleCallback) || function(id) {
    clearTimeout(id);
};

// 4. Batch Updates
let pendingBatch = null;
function batchUpdates(fn) {
    if (!pendingBatch) {
        pendingBatch = [];
        const raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (cb) => setTimeout(cb, 16);
        raf(() => {
            const batch = pendingBatch;
            pendingBatch = null;
            batch.forEach(task => {
                try { task(); } catch (e) { console.error('Batch update error:', e); }
            });
        });
    }
    pendingBatch.push(fn);
}

if (typeof window !== 'undefined') {
    window.WebOSMemoize = {
        memoize,
        debounceAsync,
        throttle,
        requestIdleCallback: requestIdleCallbackWrapper,
        cancelIdleCallback: cancelIdleCallbackWrapper,
        batchUpdates
    };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        memoize,
        debounceAsync,
        throttle,
        requestIdleCallback: requestIdleCallbackWrapper,
        cancelIdleCallback: cancelIdleCallbackWrapper,
        batchUpdates
    };
}
