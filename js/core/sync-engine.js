// js/core/sync-engine.js
class SyncEngine {
    constructor(options = {}) {
        this.store = new Map();
        this.remoteEndpoint = options.remoteEndpoint || '/api/sync';
        this.conflicts = new Map();
        this.operationLog = [];
        this.vectorClocks = new Map();
        this.lastSyncTimestamp = 0;
        this.httpClient = options.httpClient || null;
    }

    register(localId, data) {
        this.store.set(localId, { data: JSON.parse(JSON.stringify(data)), updatedAt: Date.now(), version: 1 });
        this.vectorClocks.set(localId, { local: 1, remote: 0 });
        this.operationLog.push({ type: 'REGISTER', localId, timestamp: Date.now() });
    }

    async sync(remoteId) {
        this._trigger('sync:start', { remoteId });
        try {
            const localData = this.store.get(remoteId);
            if (!localData) {
                throw new Error(`Item ${remoteId} not registered in SyncEngine`);
            }

            this._trigger('sync:progress', { remoteId, progress: 50 });

            // Delta sync payload
            const payload = {
                id: remoteId,
                data: localData.data,
                version: localData.version,
                vectorClock: this.vectorClocks.get(remoteId),
                lastSyncTimestamp: this.lastSyncTimestamp
            };

            this.operationLog.push({ type: 'SYNC_ATTEMPT', remoteId, timestamp: Date.now() });

            // Simulate or execute sync request
            let remoteResponse = { status: 'success', serverVersion: localData.version, serverData: localData.data };
            if (this.httpClient) {
                const res = await this.httpClient.post(this.remoteEndpoint, payload);
                remoteResponse = res.json();
            }

            if (remoteResponse.conflict) {
                const conflictId = `conflict_${Date.now()}_${remoteId}`;
                const conflictObj = {
                    id: conflictId,
                    localId: remoteId,
                    localData: localData.data,
                    remoteData: remoteResponse.serverData,
                    timestamp: Date.now()
                };
                this.conflicts.set(conflictId, conflictObj);
                this._trigger('sync:conflict', conflictObj);
                this._trigger('sync:error', { remoteId, error: 'Conflict detected' });
                return { status: 'conflict', conflictId };
            }

            localData.version = (remoteResponse.serverVersion || localData.version) + 1;
            this.lastSyncTimestamp = Date.now();
            this.operationLog.push({ type: 'SYNC_COMPLETE', remoteId, timestamp: Date.now() });

            this._trigger('sync:progress', { remoteId, progress: 100 });
            this._trigger('sync:complete', { remoteId, version: localData.version });

            return { status: 'success', version: localData.version };
        } catch (e) {
            this._trigger('sync:error', { remoteId, error: e.message });
            throw e;
        }
    }

    getConflicts() {
        return Array.from(this.conflicts.values());
    }

    resolve(conflictId, resolution) {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) return false;

        const localItem = this.store.get(conflict.localId);
        if (resolution.strategy === 'local') {
            localItem.data = conflict.localData;
        } else if (resolution.strategy === 'remote') {
            localItem.data = conflict.remoteData;
        } else if (resolution.mergedData) {
            localItem.data = resolution.mergedData;
        }

        localItem.version++;
        this.conflicts.delete(conflictId);
        this.operationLog.push({ type: 'RESOLVE_CONFLICT', conflictId, strategy: resolution.strategy, timestamp: Date.now() });
        return true;
    }

    _trigger(event, data) {
        if (typeof window !== 'undefined' && window.WebOSEventBus) {
            window.WebOSEventBus.emit(event, data);
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSSyncEngine = SyncEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SyncEngine };
}
