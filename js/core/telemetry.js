// js/core/telemetry.js
/**
 * WebOS Telemetry — Anonymous usage statistics, event tracking, time-series storage,
 * and aggregations (count, average, min, max, median) with JSON/CSV export.
 */
class TelemetrySystem {
    constructor() {
        this.events = [];
        this.maxEvents = 5000;
        this.eventBus = null;
    }

    setEventBus(bus) {
        this.eventBus = bus;
        if (this.eventBus && typeof this.eventBus.on === 'function') {
            this.eventBus.on('error:caught', (err) => {
                this.track('error:caught', { message: err.message, category: err.category });
            });
        }
    }

    track(eventName, properties = {}) {
        const record = {
            id: 'tel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            eventName,
            properties
        };

        this.events.push(record);
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('telemetry:tracked', record);
        }

        return record;
    }

    getEvents(filter = {}) {
        let results = [...this.events];

        if (filter.eventName) {
            results = results.filter(e => e.eventName === filter.eventName);
        }
        if (filter.since) {
            results = results.filter(e => e.timestamp >= filter.since);
        }
        if (filter.until) {
            results = results.filter(e => e.timestamp <= filter.until);
        }

        return results;
    }

    getAggregates(eventName, propertyKey) {
        const matching = this.getEvents({ eventName });
        const values = [];

        for (const ev of matching) {
            if (ev.properties && ev.properties[propertyKey] !== undefined) {
                const val = Number(ev.properties[propertyKey]);
                if (!isNaN(val)) {
                    values.push(val);
                }
            }
        }

        const count = values.length;
        if (count === 0) {
            return { count: 0, avg: 0, min: 0, max: 0, median: 0 };
        }

        values.sort((a, b) => a - b);
        const sum = values.reduce((acc, v) => acc + v, 0);
        const avg = sum / count;
        const min = values[0];
        const max = values[values.length - 1];
        let median = 0;
        const mid = Math.floor(count / 2);
        if (count % 2 === 0) {
            median = (values[mid - 1] + values[mid]) / 2;
        } else {
            median = values[mid];
        }

        return { count, avg, min, max, median };
    }

    getTimeSeries(eventName, intervalMs = 60000) {
        const matching = this.getEvents({ eventName });
        const buckets = {};

        for (const ev of matching) {
            const bucketKey = Math.floor(ev.timestamp / intervalMs) * intervalMs;
            buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
        }

        return Object.entries(buckets).map(([timestamp, count]) => ({
            timestamp: Number(timestamp),
            count
        })).sort((a, b) => a.timestamp - b.timestamp);
    }

    exportJSON() {
        return JSON.stringify(this.events, null, 2);
    }

    exportCSV() {
        if (this.events.length === 0) return 'id,timestamp,eventName,properties\n';
        const headers = ['id', 'timestamp', 'eventName', 'properties'];
        const rows = [headers.join(',')];

        for (const ev of this.events) {
            const propStr = JSON.stringify(ev.properties).replace(/"/g, '""');
            rows.push(`${ev.id},${ev.timestamp},${ev.eventName},"${propStr}"`);
        }

        return rows.join('\n');
    }

    clear() {
        this.events = [];
    }
}

if (typeof window !== 'undefined') {
    window.WebOSTelemetry = { TelemetrySystem, instance: new TelemetrySystem() };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TelemetrySystem };
}
