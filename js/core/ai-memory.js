// js/core/ai-memory.js
/**
 * WebOS AI Long-Term Memory Module (VFS-Backed)
 */
class AIMemory {
    constructor() {
        this.memoryPath = '/home/user/ai-memory.json';
        this.store = {
            preferences: {},
            facts: {},
            skills: {},
            history: []
        };
        this.loaded = false;
        this._load();
    }

    async _load() {
        try {
            if (typeof window !== 'undefined' && window.WebOSVFS) {
                const exists = await window.WebOSVFS.exists(this.memoryPath);
                if (exists) {
                    const content = await window.WebOSVFS.readFile(this.memoryPath);
                    const parsed = JSON.parse(content);
                    this.store = Object.assign(this.store, parsed);
                }
            }
        } catch (e) {}
        this.loaded = true;
    }

    async _save() {
        try {
            if (typeof window !== 'undefined' && window.WebOSVFS) {
                const exists = await window.WebOSVFS.exists('/home/user');
                if (!exists) {
                    try { await window.WebOSVFS.mkdir('/home/user'); } catch (e) {}
                }
                await window.WebOSVFS.writeFile(this.memoryPath, JSON.stringify(this.store, null, 2));
            }
        } catch (e) {}
    }

    remember(key, value, category = 'facts') {
        if (!this.store[category]) {
            this.store[category] = {};
        }
        if (category === 'history') {
            this.store.history.push({ key, value, timestamp: Date.now() });
        } else {
            this.store[category][key] = { value, timestamp: Date.now(), accessCount: 1 };
        }
        this._save();
    }

    recall(key, category = 'facts') {
        if (category === 'history') {
            return this.store.history.find(h => h.key === key);
        }
        if (this.store[category] && this.store[category][key]) {
            const item = this.store[category][key];
            item.accessCount = (item.accessCount || 1) + 1;
            // Memory decay calculation based on age
            const ageHours = (Date.now() - item.timestamp) / (1000 * 60 * 60);
            const prominence = Math.max(0.1, 1 - (ageHours / 168)); // decay over 1 week
            return { value: item.value, prominence, timestamp: item.timestamp };
        }
        return null;
    }

    forget(key, category = 'facts') {
        if (category === 'history') {
            this.store.history = this.store.history.filter(h => h.key !== key);
        } else if (this.store[category]) {
            delete this.store[category][key];
        }
        this._save();
    }

    getAll(category = 'facts') {
        if (category === 'history') return this.store.history;
        return this.store[category] || {};
    }

    search(query) {
        const q = (query || '').toLowerCase();
        const results = [];
        ['preferences', 'facts', 'skills'].forEach(cat => {
            const catObj = this.store[cat] || {};
            Object.keys(catObj).forEach(k => {
                if (k.toLowerCase().includes(q) || String(catObj[k].value).toLowerCase().includes(q)) {
                    results.push({ category: cat, key: k, value: catObj[k].value });
                }
            });
        });
        this.store.history.forEach(h => {
            if (h.key.toLowerCase().includes(q) || String(h.value).toLowerCase().includes(q)) {
                results.push({ category: 'history', key: h.key, value: h.value });
            }
        });
        return results;
    }
}

if (typeof window !== 'undefined') {
    window.WebOSAIMemory = new AIMemory();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIMemory };
}
