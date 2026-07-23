// js/core/activity-feed.js
/**
 * WebOS Activity Feed — Event stream for user actions, filtering, aggregation, and persistence.
 */
class ActivityFeed {
    constructor(vfsInstance) {
        this.vfsPath = '/home/user/activity.json';
        this.vfs = vfsInstance || (typeof window !== 'undefined' ? window.WebOSVFS : null);
        this.activities = [];
        this.subscribers = new Set();
        this.isLoaded = false;
    }

    async init() {
        if (this.isLoaded) return;
        if (!this.vfs && typeof window !== 'undefined') {
            this.vfs = window.WebOSVFS;
        }
        if (this.vfs && typeof this.vfs.readFile === 'function') {
            try {
                const raw = await this.vfs.readFile(this.vfsPath);
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) {
                        this.activities = parsed;
                    }
                }
            } catch (e) {
                console.warn('ActivityFeed: failed to load activities from VFS', e);
            }
        }
        this.isLoaded = true;
    }

    async _persist() {
        if (!this.vfs) return;
        try {
            await this.vfs.writeFile(this.vfsPath, JSON.stringify(this.activities, null, 2));
        } catch (e) {
            console.warn('ActivityFeed: failed to persist activities', e);
        }
    }

    async add(activityData) {
        await this.init();
        const activity = {
            id: 'act-' + Math.random().toString(36).substring(2, 9),
            type: activityData.type || 'system', // comment, edit, share, mention, status, system
            actor: activityData.actor || 'system',
            target: activityData.target || null,
            targetId: activityData.targetId || null,
            content: activityData.content || '',
            timestamp: activityData.timestamp || new Date().toISOString(),
            readBy: activityData.readBy || []
        };

        this.activities.unshift(activity); // Newest first
        // Keep max 1000 activities
        if (this.activities.length > 1000) {
            this.activities.pop();
        }

        await this._persist();

        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit('activity:new', activity);
        }
        for (const cb of this.subscribers) {
            try { cb(activity); } catch (e) { console.error('Activity subscriber error:', e); }
        }

        return activity;
    }

    async getFeed(userId = null, options = {}) {
        await this.init();
        let list = [...this.activities];

        // Filter by type
        if (options.type) {
            list = list.filter(a => a.type === options.type);
        }
        // Filter by actor
        if (options.actor) {
            list = list.filter(a => a.actor === options.actor);
        }
        // Filter by timeframe (startDate, endDate)
        if (options.startDate) {
            const start = new Date(options.startDate).getTime();
            list = list.filter(a => new Date(a.timestamp).getTime() >= start);
        }
        if (options.endDate) {
            const end = new Date(options.endDate).getTime();
            list = list.filter(a => new Date(a.timestamp).getTime() <= end);
        }

        const limit = options.limit || 50;
        return list.slice(0, limit);
    }

    async markRead(activityId, userId) {
        await this.init();
        const act = this.activities.find(a => a.id === activityId);
        if (act && !act.readBy.includes(userId)) {
            act.readBy.push(userId);
            await this._persist();
            return true;
        }
        return false;
    }

    async getUnreadCount(userId) {
        await this.init();
        return this.activities.filter(a => !a.readBy.includes(userId)).length;
    }

    async getAggregates() {
        await this.init();
        const actorCounts = {};
        const targetCounts = {};

        for (const a of this.activities) {
            actorCounts[a.actor] = (actorCounts[a.actor] || 0) + 1;
            if (a.target) {
                targetCounts[a.target] = (targetCounts[a.target] || 0) + 1;
            }
        }

        const topActor = Object.entries(actorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        const mostActiveTarget = Object.entries(targetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        return { topActor, mostActiveTarget, actorCounts, targetCounts };
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}

if (typeof window !== 'undefined') {
    window.WebOSActivity = new ActivityFeed();
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ActivityFeed };
}
