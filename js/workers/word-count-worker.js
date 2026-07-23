// js/workers/word-count-worker.js
/**
 * WebOS Word Count Web Worker.
 */
self.onmessage = function(e) {
    const data = e.data || {};
    const text = data.text || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;

    self.postMessage({
        wordCount: words,
        charCount: chars,
        lineCount: lines,
        timestamp: Date.now()
    });
};
