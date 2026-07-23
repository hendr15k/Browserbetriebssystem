// js/core/worker-pool.js
/**
 * WebOS Worker Pool — Multi-threading worker manager with round-robin load balancing & fallback.
 */
class WorkerPool {
    constructor(workerScriptUrl, maxWorkers) {
        this.workerScriptUrl = workerScriptUrl;
        this.maxWorkers = maxWorkers || (typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4);
        this.workers = [];
        this.freeWorkers = [];
        this.taskQueue = [];
        this.fallbackMode = typeof Worker === 'undefined';

        if (!this.fallbackMode) {
            this.initPool();
        }
    }

    initPool() {
        for (let i = 0; i < this.maxWorkers; i++) {
            try {
                const worker = new Worker(this.workerScriptUrl);
                const workerObj = { id: i, worker, busy: false };
                worker.onmessage = (e) => this.handleMessage(workerObj, e.data);
                worker.onerror = (err) => {
                    console.error(`Worker [${i}] error:`, err);
                    workerObj.busy = false;
                    this.dispatchNext();
                };
                this.workers.push(workerObj);
                this.freeWorkers.push(workerObj);
            } catch (e) {
                console.warn('Worker initialization failed, fallback to main thread:', e);
                this.fallbackMode = true;
                break;
            }
        }
    }

    handleMessage(workerObj, data) {
        const task = workerObj.currentTask;
        const { resolve, reject } = task || {};
        workerObj.currentTask = null;
        workerObj.busy = false;
        this.freeWorkers.push(workerObj);

        if (data && data.error) {
            if (reject) reject(data.error);
        } else {
            if (resolve) resolve(data);
        }
        this.dispatchNext();
    }

    execute(taskData) {
        return new Promise((resolve, reject) => {
            const task = { taskId: Math.random().toString(36).substring(2), data: taskData, resolve, reject };
            if (this.fallbackMode) {
                this.executeFallback(task);
                return;
            }
            this.taskQueue.push(task);
            this.dispatchNext();
        });
    }

    dispatchNext() {
        if (this.taskQueue.length === 0 || this.freeWorkers.length === 0) return;
        const workerObj = this.freeWorkers.shift();
        const task = this.taskQueue.shift();
        workerObj.busy = true;
        workerObj.currentTask = task;
        workerObj.worker.postMessage(task.data);
    }

    executeFallback(task) {
        // Sync or async main-thread fallback simulation
        try {
            // If workerScriptUrl contains word-count-worker
            if (this.workerScriptUrl.includes('word-count-worker')) {
                const text = task.data.text || '';
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                task.resolve({ wordCount: words, chars: text.length });
            } else {
                task.resolve({ result: task.data });
            }
        } catch (e) {
            task.reject(e);
        }
    }

    terminate() {
        this.workers.forEach(w => w.worker.terminate());
        this.workers = [];
        this.freeWorkers = [];
        this.taskQueue = [];
    }
}

if (typeof window !== 'undefined') {
    window.WebOSWorkerPool = WorkerPool;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorkerPool };
}
