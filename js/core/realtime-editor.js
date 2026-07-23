// js/core/realtime-editor.js
/**
 * WebOS Real-Time Editor — Operational Transformation (OT) for text collaboration.
 */
class TextOperation {
    constructor(ops = []) {
        this.ops = ops; // Array of numbers (retain count) or strings (insert text) or negative numbers / objects for delete
    }

    retain(n) {
        if (n === 0) return this;
        if (typeof this.ops[this.ops.length - 1] === 'number' && this.ops[this.ops.length - 1] > 0 && n > 0) {
            this.ops[this.ops.length - 1] += n;
        } else {
            this.ops.push(n);
        }
        return this;
    }

    insert(str) {
        if (str === '') return this;
        if (typeof this.ops[this.ops.length - 1] === 'string') {
            this.ops[this.ops.length - 1] += str;
        } else {
            this.ops.push(str);
        }
        return this;
    }

    delete(n) {
        if (n === 0) return this;
        const delVal = -Math.abs(n);
        if (typeof this.ops[this.ops.length - 1] === 'number' && this.ops[this.ops.length - 1] < 0 && delVal < 0) {
            this.ops[this.ops.length - 1] += delVal;
        } else {
            this.ops.push(delVal);
        }
        return this;
    }

    apply(str) {
        let idx = 0;
        let result = '';
        for (const op of this.ops) {
            if (typeof op === 'number') {
                if (op > 0) {
                    result += str.slice(idx, idx + op);
                    idx += op;
                } else {
                    idx += Math.abs(op);
                }
            } else if (typeof op === 'string') {
                result += op;
            }
        }
        result += str.slice(idx);
        return result;
    }

    invert(str) {
        let idx = 0;
        const inv = new TextOperation();
        for (const op of this.ops) {
            if (typeof op === 'number') {
                if (op > 0) {
                    inv.retain(op);
                    idx += op;
                } else {
                    const delLen = Math.abs(op);
                    inv.insert(str.slice(idx, idx + delLen));
                    idx += delLen;
                }
            } else if (typeof op === 'string') {
                inv.delete(op.length);
            }
        }
        return inv;
    }

    compose(other) {
        const comp = new TextOperation();
        const ops1 = [...this.ops];
        const ops2 = [...other.ops];
        let o1 = ops1.shift();
        let o2 = ops2.shift();

        while (o1 !== undefined || o2 !== undefined) {
            if (typeof o1 === 'string') {
                comp.insert(o1);
                o1 = ops1.shift();
                continue;
            }
            if (typeof o2 === 'number' && o2 < 0) {
                comp.delete(Math.abs(o2));
                o2 = ops2.shift();
                continue;
            }
            if (o1 === undefined || o2 === undefined) {
                throw new Error('Mismatched operation lengths in compose');
            }

            if (typeof o1 === 'number' && o1 > 0 && typeof o2 === 'number' && o2 > 0) {
                if (o1 > o2) {
                    comp.retain(o2);
                    o1 -= o2;
                    o2 = ops2.shift();
                } else if (o1 === o2) {
                    comp.retain(o1);
                    o1 = ops1.shift();
                    o2 = ops2.shift();
                } else {
                    comp.retain(o1);
                    o2 -= o1;
                    o1 = ops1.shift();
                }
            } else if (typeof o2 === 'string') {
                comp.insert(o2);
                o2 = ops2.shift();
            } else if (typeof o1 === 'number' && o1 < 0) {
                comp.delete(Math.abs(o1));
                o1 = ops1.shift();
            }
        }
        return comp;
    }

    static transform(op1, op2) {
        const o1 = [...op1.ops];
        const o2 = [...op2.ops];
        const prime1 = new TextOperation();
        const prime2 = new TextOperation();

        let i1 = o1.shift();
        let i2 = o2.shift();

        while (i1 !== undefined || i2 !== undefined) {
            if (typeof i1 === 'string' && (i2 === undefined || (typeof i2 === 'number' && i2 > 0))) {
                prime1.insert(i1);
                prime2.retain(i1.length);
                i1 = o1.shift();
            } else if (typeof i2 === 'string' && (i1 === undefined || (typeof i1 === 'number' && i1 > 0))) {
                prime1.retain(i2.length);
                prime2.insert(i2);
                i2 = o2.shift();
            } else if (typeof i1 === 'number' && i1 < 0 && (i2 === undefined || (typeof i2 === 'number' && i2 > 0))) {
                const len = Math.abs(i1);
                prime1.delete(len);
                i1 = o1.shift();
            } else if (typeof i2 === 'number' && i2 < 0 && (i1 === undefined || (typeof i1 === 'number' && i1 > 0))) {
                const len = Math.abs(i2);
                prime2.delete(len);
                i2 = o2.shift();
            } else if (typeof i1 === 'number' && i1 > 0 && typeof i2 === 'number' && i2 > 0) {
                if (i1 > i2) {
                    prime1.retain(i2);
                    prime2.retain(i2);
                    i1 -= i2;
                    i2 = o2.shift();
                } else if (i1 === i2) {
                    prime1.retain(i1);
                    prime2.retain(i1);
                    i1 = o1.shift();
                    i2 = o2.shift();
                } else {
                    prime1.retain(i1);
                    prime2.retain(i1);
                    i2 -= i1;
                    i1 = o1.shift();
                }
            } else {
                // Handle concurrent insert/delete or insert/insert tie breaking
                if (typeof i1 === 'string' && typeof i2 === 'string') {
                    // Tie break by string content or arbitrary deterministic order
                    prime1.insert(i1);
                    prime2.retain(i1.length);
                    i1 = o1.shift();
                } else {
                    if (i1 !== undefined) {
                        if (typeof i1 === 'number' && i1 > 0) {
                            prime1.retain(i1);
                        } else if (typeof i1 === 'string') {
                            prime1.insert(i1);
                        } else {
                            prime1.delete(Math.abs(i1));
                        }
                        i1 = o1.shift();
                    }
                    if (i2 !== undefined) {
                        if (typeof i2 === 'number' && i2 > 0) {
                            prime2.retain(i2);
                        } else if (typeof i2 === 'string') {
                            prime2.insert(i2);
                        } else {
                            prime2.delete(Math.abs(i2));
                        }
                        i2 = o2.shift();
                    }
                }
            }
        }
        return [prime1, prime2];
    }
}

class RealtimeEditor {
    constructor(docId, initialContent = '') {
        this.docId = docId;
        this.content = initialContent;
        this.version = 0;
        this.history = [];
        this.redoStack = [];
        this.cursors = new Map(); // userId -> { pos, selection, lastActive }
        this.listeners = new Set();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    _notify(eventData) {
        for (const cb of this.listeners) {
            try { cb(eventData); } catch (e) { console.error('Editor listener error:', e); }
        }
    }

    localInsert(pos, text) {
        const op = new TextOperation();
        if (pos > 0) op.retain(pos);
        op.insert(text);
        if (pos < this.content.length) op.retain(this.content.length - pos);
        return this.apply(op, true);
    }

    localDelete(pos, length) {
        const op = new TextOperation();
        if (pos > 0) op.retain(pos);
        op.delete(length);
        if (pos + length < this.content.length) op.retain(this.content.length - (pos + length));
        return this.apply(op, true);
    }

    apply(op, isLocal = false) {
        this.content = op.apply(this.content);
        this.version++;
        if (isLocal) {
            this.history.push({ op, version: this.version });
            this.redoStack = [];
        }
        this._notify({ type: 'change', content: this.content, version: this.version, op });
        return op;
    }

    remoteOp(op) {
        return this.apply(op, false);
    }

    updateCursor(userId, pos, selection = null) {
        this.cursors.set(userId, { pos, selection, lastActive: Date.now() });
        this._notify({ type: 'cursor', userId, pos, selection });
    }

    getCursors() {
        return Object.fromEntries(this.cursors.entries());
    }

    undo() {
        if (this.history.length === 0) return false;
        const entry = this.history.pop();
        const inv = entry.op.invert(this.content);
        this.content = inv.apply(this.content);
        this.version++;
        this.redoStack.push(entry);
        this._notify({ type: 'undo', content: this.content, version: this.version });
        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;
        const entry = this.redoStack.pop();
        this.content = entry.op.apply(this.content);
        this.version++;
        this.history.push(entry);
        this._notify({ type: 'redo', content: this.content, version: this.version });
        return true;
    }
}

class MockTransport {
    constructor(editor) {
        this.editor = editor;
        this.peers = [];
    }

    connect(peer) {
        this.peers.push(peer);
    }

    send(op) {
        for (const peer of this.peers) {
            peer.receive(op);
        }
    }

    receive(op) {
        this.editor.remoteOp(op);
    }
}

class RealtimeEditorEngine {
    static createEditor(docId, initialContent = '') {
        return new RealtimeEditor(docId, initialContent);
    }
}

if (typeof window !== 'undefined') {
    window.WebOSRealtimeEditor = RealtimeEditorEngine;
    window.WebOSRealtimeClasses = { RealtimeEditor, TextOperation, MockTransport };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RealtimeEditorEngine, RealtimeEditor, TextOperation, MockTransport };
}
