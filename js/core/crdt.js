// js/core/crdt.js
/**
 * WebOS CRDT Engine — Conflict-free Replicated Data Types for distributed collaboration.
 */
class LamportClock {
    constructor(nodeId = 'node-' + Math.random().toString(36).substring(2, 9)) {
        this.nodeId = nodeId;
        this.counter = 0;
    }

    tick() {
        this.counter++;
        return { counter: this.counter, nodeId: this.nodeId };
    }

    update(remoteCounter) {
        this.counter = Math.max(this.counter, remoteCounter) + 1;
        return { counter: this.counter, nodeId: this.nodeId };
    }

    compare(ts1, ts2) {
        if (ts1.counter !== ts2.counter) {
            return ts1.counter - ts2.counter;
        }
        return ts1.nodeId.localeCompare(ts2.nodeId);
    }
}

class GCounter {
    constructor(id = 'node-' + Math.random().toString(36).substring(2, 9)) {
        this.id = id;
        this.state = {};
        this.state[id] = 0;
    }

    increment(val = 1) {
        if (val < 0) throw new Error('GCounter only increments positive values');
        this.state[this.id] = (this.state[this.id] || 0) + val;
    }

    value() {
        let sum = 0;
        for (const k in this.state) {
            sum += this.state[k];
        }
        return sum;
    }

    merge(remote) {
        const remoteState = remote instanceof GCounter ? remote.state : remote;
        for (const k in remoteState) {
            this.state[k] = Math.max(this.state[k] || 0, remoteState[k]);
        }
    }

    toJSON() {
        return { type: 'GCounter', id: this.id, state: { ...this.state } };
    }

    static fromJSON(json) {
        const c = new GCounter(json.id);
        c.state = { ...json.state };
        return c;
    }
}

class PNCounter {
    constructor(id = 'node-' + Math.random().toString(36).substring(2, 9)) {
        this.id = id;
        this.p = new GCounter(id);
        this.n = new GCounter(id);
    }

    increment(val = 1) {
        this.p.increment(val);
    }

    decrement(val = 1) {
        this.n.increment(val);
    }

    value() {
        return this.p.value() - this.n.value();
    }

    merge(remote) {
        const remoteP = remote instanceof PNCounter ? remote.p : remote.p;
        const remoteN = remote instanceof PNCounter ? remote.n : remote.n;
        this.p.merge(remoteP);
        this.n.merge(remoteN);
    }

    toJSON() {
        return { type: 'PNCounter', id: this.id, p: this.p.toJSON(), n: this.n.toJSON() };
    }

    static fromJSON(json) {
        const c = new PNCounter(json.id);
        c.p = GCounter.fromJSON(json.p);
        c.n = GCounter.fromJSON(json.n);
        return c;
    }
}

class GSet {
    constructor(id = 'node-' + Math.random().toString(36).substring(2, 9)) {
        this.id = id;
        this.elements = new Set();
    }

    add(item) {
        this.elements.add(JSON.stringify(item));
    }

    has(item) {
        return this.elements.has(JSON.stringify(item));
    }

    value() {
        return Array.from(this.elements).map(e => JSON.parse(e));
    }

    merge(remote) {
        const remoteEls = remote instanceof GSet ? remote.value() : (Array.isArray(remote) ? remote : remote.elements || []);
        for (const item of remoteEls) {
            this.add(item);
        }
    }

    toJSON() {
        return { type: 'GSet', id: this.id, elements: this.value() };
    }

    static fromJSON(json) {
        const s = new GSet(json.id);
        for (const el of json.elements) {
            s.add(el);
        }
        return s;
    }
}

class ORSet {
    constructor(id = 'node-' + Math.random().toString(36).substring(2, 9)) {
        this.id = id;
        // Map of element (stringified) -> Set of unique tags
        this.addSet = new Map();
        // Set of removed tags (stringified)
        this.removeSet = new Set();
        this.counter = 0;
    }

    _tag(item) {
        this.counter++;
        return `${this.id}-${this.counter}-${Date.now()}`;
    }

    add(item) {
        const key = JSON.stringify(item);
        const tag = this._tag(item);
        if (!this.addSet.has(key)) {
            this.addSet.set(key, new Set());
        }
        this.addSet.get(key).add(tag);
        return tag;
    }

    remove(item) {
        const key = JSON.stringify(item);
        if (this.addSet.has(key)) {
            for (const tag of this.addSet.get(key)) {
                this.removeSet.add(tag);
            }
        }
    }

    has(item) {
        const key = JSON.stringify(item);
        if (!this.addSet.has(key)) return false;
        const tags = this.addSet.get(key);
        for (const tag of tags) {
            if (!this.removeSet.has(tag)) {
                return true;
            }
        }
        return false;
    }

    value() {
        const result = [];
        for (const [key, tags] of this.addSet.entries()) {
            let active = false;
            for (const tag of tags) {
                if (!this.removeSet.has(tag)) {
                    active = true;
                    break;
                }
            }
            if (active) {
                result.push(JSON.parse(key));
            }
        }
        return result;
    }

    merge(remote) {
        const remoteAdd = remote instanceof ORSet ? remote.addSet : (remote.addSet ? new Map(Object.entries(remote.addSet).map(([k, v]) => [k, new Set(v)])) : new Map());
        const remoteRem = remote instanceof ORSet ? remote.removeSet : (remote.removeSet ? new Set(remote.removeSet) : new Set());

        for (const [key, tags] of remoteAdd.entries()) {
            if (!this.addSet.has(key)) {
                this.addSet.set(key, new Set());
            }
            for (const tag of tags) {
                this.addSet.get(key).add(tag);
            }
        }

        for (const tag of remoteRem) {
            this.removeSet.add(tag);
        }
    }

    toJSON() {
        const addObj = {};
        for (const [k, v] of this.addSet.entries()) {
            addObj[k] = Array.from(v);
        }
        return {
            type: 'ORSet',
            id: this.id,
            counter: this.counter,
            addSet: addObj,
            removeSet: Array.from(this.removeSet)
        };
    }

    static fromJSON(json) {
        const s = new ORSet(json.id);
        s.counter = json.counter || 0;
        if (json.addSet) {
            for (const [k, v] of Object.entries(json.addSet)) {
                s.addSet.set(k, new Set(v));
            }
        }
        if (json.removeSet) {
            s.removeSet = new Set(json.removeSet);
        }
        return s;
    }
}

class LWWRegister {
    constructor(id = 'node-' + Math.random().toString(36).substring(2, 9), initialValue = null) {
        this.id = id;
        this.val = initialValue;
        this.timestamp = { counter: 0, nodeId: id };
        this.clock = new LamportClock(id);
    }

    set(value) {
        this.val = value;
        this.timestamp = this.clock.tick();
    }

    value() {
        return this.val;
    }

    merge(remote) {
        const remoteVal = remote.val !== undefined ? remote.val : remote.value();
        const remoteTs = remote.timestamp || { counter: remote.counter || 0, nodeId: remote.id || 'remote' };

        this.clock.update(remoteTs.counter);
        const cmp = this.clock.compare(remoteTs, this.timestamp);

        if (cmp > 0 || (cmp === 0 && remoteTs.nodeId.localeCompare(this.timestamp.nodeId) > 0)) {
            this.val = remoteVal;
            this.timestamp = remoteTs;
        }
    }

    toJSON() {
        return { type: 'LWWRegister', id: this.id, val: this.val, timestamp: this.timestamp };
    }

    static fromJSON(json) {
        const r = new LWWRegister(json.id, json.val);
        r.timestamp = json.timestamp;
        r.clock.counter = Math.max(r.clock.counter, json.timestamp.counter);
        return r;
    }
}

class RGA {
    constructor(id = 'node-' + Math.random().toString(36).substring(2, 9)) {
        this.id = id;
        this.clock = new LamportClock(id);
        // List of elements: { id: {counter, nodeId}, val, deleted: boolean, originLeft: {counter, nodeId} | null }
        this.nodes = [];
        // Sentinel start node
        this.startNode = { id: { counter: 0, nodeId: 'root' }, val: null, deleted: false, originLeft: null };
        this.nodes.push(this.startNode);
    }

    insert(index, val) {
        const ts = this.clock.tick();
        // Find active node at visible index
        let activeIdx = 0;
        let visibleCount = 0;
        let targetNode = this.startNode;

        for (let i = 0; i < this.nodes.length; i++) {
            if (!this.nodes[i].deleted && this.nodes[i] !== this.startNode) {
                if (visibleCount === index) {
                    targetNode = this.nodes[i];
                    break;
                }
                visibleCount++;
            }
            if (i === this.nodes.length - 1) {
                targetNode = this.nodes[i];
            }
        }

        const newNode = { id: ts, val, deleted: false, originLeft: targetNode.id };
        
        // Find insert position after targetNode and concurrent nodes
        let insertPos = this.nodes.indexOf(targetNode) + 1;
        while (insertPos < this.nodes.length) {
            const nextNode = this.nodes[insertPos];
            if (nextNode.originLeft && this._compareId(nextNode.originLeft, targetNode.id) === 0) {
                if (this._compareId(nextNode.id, ts) > 0) {
                    break;
                }
                insertPos++;
            } else {
                break;
            }
        }

        this.nodes.splice(insertPos, 0, newNode);
        return newNode;
    }

    delete(index) {
        let visibleCount = 0;
        for (let i = 1; i < this.nodes.length; i++) {
            if (!this.nodes[i].deleted) {
                if (visibleCount === index) {
                    this.nodes[i].deleted = true;
                    return this.nodes[i];
                }
                visibleCount++;
            }
        }
        return null;
    }

    value() {
        return this.nodes.filter(n => !n.deleted && n !== this.startNode).map(n => n.val);
    }

    _compareId(id1, id2) {
        if (!id1) return -1;
        if (!id2) return 1;
        if (id1.counter !== id2.counter) {
            return id2.counter - id1.counter; // Descending order for concurrent tie-breaking
        }
        return id2.nodeId.localeCompare(id1.nodeId);
    }

    merge(remote) {
        const remoteNodes = remote instanceof RGA ? remote.nodes : (remote.nodes || []);
        for (const rNode of remoteNodes) {
            if (rNode === remote.startNode || rNode.id.nodeId === 'root') continue;
            const existing = this.nodes.find(n => n.id.counter === rNode.id.counter && n.id.nodeId === rNode.id.nodeId);
            if (!existing) {
                // Insert maintaining causal order
                this.clock.update(rNode.id.counter);
                this._insertRemoteNode(rNode);
            } else {
                if (rNode.deleted) {
                    existing.deleted = true;
                }
            }
        }
    }

    _insertRemoteNode(rNode) {
        // Find originLeft
        let targetIdx = this.nodes.findIndex(n => n.id.counter === rNode.originLeft.counter && n.id.nodeId === rNode.originLeft.nodeId);
        if (targetIdx === -1) targetIdx = 0;

        let insertPos = targetIdx + 1;
        while (insertPos < this.nodes.length) {
            const nextNode = this.nodes[insertPos];
            if (nextNode.originLeft && nextNode.originLeft.counter === rNode.originLeft.counter && nextNode.originLeft.nodeId === rNode.originLeft.nodeId) {
                if (this._compareId(nextNode.id, rNode.id) > 0) {
                    break;
                }
                insertPos++;
            } else {
                break;
            }
        }
        this.nodes.splice(insertPos, 0, { ...rNode });
    }

    toJSON() {
        return {
            type: 'RGA',
            id: this.id,
            nodes: this.nodes.map(n => ({ ...n }))
        };
    }

    static fromJSON(json) {
        const r = new RGA(json.id);
        r.nodes = json.nodes.map(n => ({ ...n }));
        r.startNode = r.nodes[0];
        return r;
    }
}

class CRDTEngine {
    static create(type, id) {
        switch (type) {
            case 'GCounter': return new GCounter(id);
            case 'PNCounter': return new PNCounter(id);
            case 'GSet': return new GSet(id);
            case 'ORSet': return new ORSet(id);
            case 'LWWRegister': return new LWWRegister(id);
            case 'RGA': return new RGA(id);
            default: throw new Error(`Unknown CRDT type: ${type}`);
        }
    }

    static fromJSON(json) {
        switch (json.type) {
            case 'GCounter': return GCounter.fromJSON(json);
            case 'PNCounter': return PNCounter.fromJSON(json);
            case 'GSet': return GSet.fromJSON(json);
            case 'ORSet': return ORSet.fromJSON(json);
            case 'LWWRegister': return LWWRegister.fromJSON(json);
            case 'RGA': return RGA.fromJSON(json);
            default: throw new Error(`Unknown CRDT type in JSON: ${json.type}`);
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebOSCRDT = CRDTEngine;
    window.WebOSCRDTClasses = { GCounter, PNCounter, GSet, ORSet, LWWRegister, RGA, LamportClock };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRDTEngine, GCounter, PNCounter, GSet, ORSet, LWWRegister, RGA, LamportClock };
}
