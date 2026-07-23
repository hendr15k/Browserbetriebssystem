// Regression tests for Round 6 bug fixes
// (BUG 15, 19, 21, 23, 26, 28, 29, 31, 32)

const fs = require('fs');
const path = require('path');

// ---------- Minimal browser globals ----------
const storage = {
  data: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.data, k) ? this.data[k] : null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; },
  clear() { this.data = {}; }
};

function makeEl(tag = 'div') {
  return {
    tagName: tag.toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    attributes: {},
    innerHTML: '',
    textContent: '',
    id: '',
    value: '',
    focus() {},
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); return c; },
    pause() {},
    src: '',
    addEventListener() {},
    removeEventListener() {},
    setAttribute(k, v) { this.attributes[k] = v; },
    removeAttribute(k) { delete this.attributes[k]; },
    getAttribute(k) { return this.attributes[k] || null; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }; },
    closest() { return null; },
    querySelector(sel) { return null; },
    querySelectorAll(sel) {
      // crude matcher for our needs
      if (this._matchesForSel && this._matchesForSel[sel]) return this._matchesForSel[sel];
      return [];
    },
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    }
  };
}

const elementRegistry = {};
function makeElWithId(id, tag = 'div') {
  const e = makeEl(tag);
  e._matchesForSel = {};
  e.id = id;
  e.classList = e.classList; // already created above
  elementRegistry[id] = e;
  return e;
}

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) { return elementRegistry[id] || null; },
  querySelectorAll(sel) {
    const out = [];
    Object.values(elementRegistry).forEach(el => {
      if (sel === '.window') out.push(el);
    });
    return out;
  },
  querySelector() { return null; },
  body: makeEl('body'),
  head: makeEl('head'),
  createElement(tag) { return makeEl(tag); },
  hidden: false,
  documentElement: makeEl('html'),
  activeElement: null
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener() {},
  removeEventListener() {},
  setTimeout, clearTimeout, setInterval, clearInterval,
  localStorage: storage,
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  navigator: {
    userAgent: 'node-test',
    clipboard: { writeText() { return Promise.resolve(); } },
    mediaDevices: {
      getUserMedia: () => Promise.resolve({ getTracks() { return []; } }),
      enumerateDevices: () => Promise.resolve([])
    }
  },
  WebOSEventBus: null,
  AudioContext: function() {
    this.close = () => {};
    this.createOscillator = () => ({ start() {}, stop() {}, connect() {}, disconnect() {}, frequency: { value: 0 } });
    this.createGain = () => ({ gain: { value: 1 }, connect() {}, disconnect() {} });
    this.createAnalyser = () => ({ connect() {}, disconnect() {}, frequencyBinCount: 0, getByteFrequencyData() {} });
    this.destination = { connect() {} };
  },
  MediaRecorder: function() {
    this.stream = null;
    this.ondataavailable = null;
    this.onstop = null;
    this.start = () => {};
    this.stop = () => { if (this.onstop) this.onstop(); };
    this.release = () => {};
    this.ondataavailable = null;
  },
  URL: { createObjectURL: () => 'blob:test-' + Math.random().toString(36).slice(2), revokeObjectURL() {} },
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  screen: { width: 1920, height: 1080 },
  isSecureContext: true,
  DOMMatrix: function() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
};

global.localStorage = storage;
global.URL = global.window.URL;
global.performance = global.window.performance;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;
global.AudioContext = global.window.AudioContext;
global.MediaRecorder = global.window.MediaRecorder;
global.navigator = global.window.navigator;

// ---------- Test framework ----------
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (!cond) {
    throw new Error('Assertion failed: ' + (msg || '(no msg)'));
  }
}
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (e) {
    failed++;
    console.error(`[FAIL] ${name}: ${e.message}`);
  }
}
function section(s) { console.log(`\n--- ${s} ---`); }

// ---------- Load script.js ----------
const vm = require('vm');
const scriptSrc = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const strippedSrc = scriptSrc.replace(
  /^(updateClock\(\);?)\s*$/m,
  '/* stripped for tests */'
);

const sandbox = {
  ...global,
  document,
  window,
  localStorage: storage,
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  alert: () => {},
  showNotification: () => {},
  process: { env: {} }
};
sandbox.window.WebOSEventBus = sandbox.window.WebOSEventBus;
vm.createContext(sandbox);
vm.runInContext(strippedSrc, sandbox, { filename: 'script.js' });

const get = (k) => sandbox[k];

// =================================================================
// Section 1 — BUG 15: VoiceRecorder cleanup disposes analyser/mediaRecorder
// =================================================================
section('BUG 15 — VoiceRecorder cleanup disposes analyser + mediaRecorder');

test('BUG 15a: cleanup calls analyser.disconnect()', () => {
  // Use a more permissive grep — find code between the Voice Recorder
  // cleanup header and its terminus (delete voiceRecorderStates[windowId]).
  const idx = scriptSrc.indexOf('Cleanup Voice Recorder');
  const end = scriptSrc.indexOf('delete voiceRecorderStates[windowId]', idx);
  const block = scriptSrc.slice(idx, end);
  assert(block.length > 100, 'VoiceRecorder cleanup block not found');
  assert(/analyser\.disconnect\(\)/.test(block),
    'cleanup must call analyser.disconnect()');
});

test('BUG 15b: cleanup nulls mediaRecorder handlers + tries release()', () => {
  const idx = scriptSrc.indexOf('Cleanup Voice Recorder');
  const end = scriptSrc.indexOf('delete voiceRecorderStates[windowId]', idx);
  const block = scriptSrc.slice(idx, end);
  assert(block.length > 100, 'VoiceRecorder cleanup block not found');
  assert(/mediaRecorder\.ondataavailable\s*=\s*null/.test(block),
    'cleanup must null mediaRecorder.ondataavailable');
  assert(/typeof state\.mediaRecorder\.release\s*===\s*['"]function['"]/.test(block),
    'cleanup must feature-test for mediaRecorder.release()');
});

// =================================================================
// Section 2 — BUG 19: initClock defensive re-init
// =================================================================
section('BUG 19 — initClock defensively clears stale interval');

test('BUG 19a: initClock clears an existing clockInterval', () => {
  const block = scriptSrc.match(/function initClock\([\s\S]{0,5000}?clockStates\[windowId\]\.clockInterval = setInterval/);
  assert(block, 'initClock function not located');
  assert(/clearInterval\(clockStates\[windowId\]\.clockInterval\)/.test(block[0]),
    'initClock must clearInterval any pre-existing clockInterval before re-setting');
});

// =================================================================
// Section 3 — BUG 21: initPong tracks all RAFs in _pendingRaf
// =================================================================
section('BUG 21 — Pong RAF cancellation covers all queued');

test('BUG 21a: Pong update loop pushes RAF id into _pendingRaf', () => {
  const idx = scriptSrc.indexOf('const paddleWidth = 10;');
  const end = scriptSrc.indexOf('if (win) {', idx + 500);  // find the second "if (win)" block after Pong init
  const block = scriptSrc.slice(idx, end + 400);
  assert(/game\.requestId\s*=\s*nextRaf/.test(block) ||
    /\)\.push\(nextRaf\)/.test(block),
    'Pong update must track the new RAF id in _pendingRaf');
});

test('BUG 21b: Pong cleanup cancels every RAF in _pendingRaf', () => {
  const idx = scriptSrc.indexOf('Cleanup Pong Game state');
  // Find the last `delete pongGames[windowId];` after idx — the cleanup's
  // actual termination. (The first hit is in a comment.)
  const after = scriptSrc.slice(idx);
  const match = after.match(/delete pongGames\[windowId\];/g);
  assert(match, 'no delete pongGames[windowId]; statement found');
  // Use the second/last occurrence after the header
  const end = after.indexOf(match[match.length - 1]) + idx;
  const block = scriptSrc.slice(idx, end + match[match.length - 1].length);
  assert(/_pendingRaf[\s\S]*cancelAnimationFrame/.test(block),
    'Pong cleanup must iterate _pendingRaf and cancelAnimationFrame each');
});

// =================================================================
// Section 4 — BUG 23: Sticky Note delete race
// =================================================================
section('BUG 23 — deleteStickyNote closes windows before removing from storage');

test('BUG 23a: deleteStickyNote closes windows BEFORE touching storage', () => {
  const fn = get('deleteStickyNote').toString();
  // find first "closeWindow" call and first "saveStickyNotesToStorage" call;
  // closeWindow must come first
  const closeIdx = fn.indexOf('closeWindow(');
  const saveIdx = fn.indexOf('saveStickyNotesToStorage(');
  assert(closeIdx !== -1 && saveIdx !== -1, 'both closeWindow and saveStickyNotesToStorage must be present');
  assert(closeIdx < saveIdx, `closeWindow() must precede saveStickyNotesToStorage() (close=${closeIdx}, save=${saveIdx})`);
});

test('BUG 23b: deleteStickyNote bails if noteId is unknown', () => {
  const fn = get('deleteStickyNote').toString();
  assert(/if\s*\(\s*!stickyNotes\[noteId\]\)\s*return/.test(fn),
    'deleteStickyNote must early-return on missing noteId');
});

// =================================================================
// Section 5 — BUG 26: safeJsonParse warns on null parsed value
// =================================================================
section('BUG 26 — safeJsonParse surfaces silent null fallback');

test('BUG 26a: safeJsonParse emits warn when parsed value is null', () => {
  const fn = get('safeJsonParse').toString();
  assert(/parsed\s*===\s*null\s*\|\|\s*parsed\s*===\s*undefined/.test(fn) ||
    /parsed\s*===\s*null/.test(fn),
    'safeJsonParse must explicitly test parsed === null');
  assert(/console\.warn/.test(fn), 'safeJsonParse must console.warn when falling back from a null-ish value');
});

// =================================================================
// Section 6 — BUG 28: Tetris RAF cancellation
// =================================================================
section('BUG 28 — Tetris RAF cancellation covers all queued');

test('BUG 28a: Tetris update loop pushes RAF id into _pendingRaf', () => {
  const idx = scriptSrc.indexOf('function update(time = 0)');
  const end = scriptSrc.indexOf('if (win) {', idx + 200);
  const block = scriptSrc.slice(idx, end + 400);
  assert(/tetrisGames\[windowId\]\.requestId\s*=\s*nextRaf/.test(block) ||
    /\)\.push\(nextRaf\)/.test(block),
    'Tetris update must track the new RAF id in _pendingRaf');
});

test('BUG 28b: Tetris cleanup cancels every RAF in _pendingRaf', () => {
  const idx = scriptSrc.indexOf('Cleanup Tetris Game state');
  const after = scriptSrc.slice(idx);
  const match = after.match(/delete tetrisGames\[windowId\];/g);
  assert(match, 'no delete tetrisGames[windowId]; statement found');
  const end = after.indexOf(match[match.length - 1]) + idx;
  const block = scriptSrc.slice(idx, end + match[match.length - 1].length);
  assert(/_pendingRaf[\s\S]*cancelAnimationFrame/.test(block),
    'Tetris cleanup must iterate _pendingRaf and cancelAnimationFrame each');
});

// =================================================================
// Section 7 — BUG 29: Lazy scheduledNotifications timer
// =================================================================
section('BUG 29 — Lazy notification poll (no permanent 30 s interval)');

test('BUG 29a: No permanent setInterval for notifications', () => {
  // The Round 4 setInterval(checkScheduledNotifications, 30000) must be gone.
  const bad = scriptSrc.match(/setInterval\(checkScheduledNotifications,\s*30000\)/);
  assert(!bad, 'Round 4 setInterval(checkScheduledNotifications, 30000) still present');
});

test('BUG 29b: rescheduleNotificationPoll helper exists', () => {
  assert(typeof get('rescheduleNotificationPoll') === 'function',
    'rescheduleNotificationPoll helper missing');
});

test('BUG 29c: scheduleNotification calls rescheduleNotificationPoll', () => {
  const fn = get('scheduleNotification').toString();
  assert(/rescheduleNotificationPoll\(\)/.test(fn),
    'scheduleNotification must trigger rescheduleNotificationPoll');
});

test('BUG 29d: cancelScheduledNotification calls rescheduleNotificationPoll', () => {
  const fn = get('cancelScheduledNotification').toString();
  assert(/rescheduleNotificationPoll\(\)/.test(fn),
    'cancelScheduledNotification must trigger rescheduleNotificationPoll');
});

// =================================================================
// Section 8 — BUG 31: All audio/video/source cleanup
// =================================================================
section('BUG 31 — querySelectorAll walks every audio/video/source');

test('BUG 31a: cleanup iterates all media + source tags', () => {
  const block = scriptSrc.match(/const winRef = document\.getElementById\(windowId\);[\s\S]{0,1500}?const closingVideo|const winRef = document\.getElementById\(windowId\);[\s\S]{0,1500}?Revoke any tracked media/);
  assert(block, 'windowRef cleanup block not located');
  assert(/querySelectorAll\(\s*['"]audio,\s*video,\s*source['"]\s*\)/.test(block[0]),
    'cleanup must use querySelectorAll("audio, video, source")');
});

// =================================================================
// Section 9 — BUG 32: setTrackedMediaUrl atomic setter
// =================================================================
section('BUG 32 — single-source-of-truth blob URL setter');

test('BUG 32a: setTrackedMediaUrl helper exists and revokes prev', () => {
  assert(typeof get('setTrackedMediaUrl') === 'function', 'setTrackedMediaUrl helper missing');
  const fn = get('setTrackedMediaUrl').toString();
  assert(/URL\.revokeObjectURL\(prev\)/.test(fn),
    'setTrackedMediaUrl must call URL.revokeObjectURL(prev)');
  assert(/mediaBlobUrls\[windowId\]\[kind\]\s*=\s*url/.test(fn),
    'setTrackedMediaUrl must write the new url into mediaBlobUrls');
});

test('BUG 32b: handleMusicFile uses setTrackedMediaUrl', () => {
  const fn = get('handleMusicFile').toString();
  assert(/setTrackedMediaUrl\(\s*windowId\s*,\s*['"]audio['"]/.test(fn),
    'handleMusicFile must use setTrackedMediaUrl(windowId, "audio", ...)');
  // The old if/else if pattern must be gone
  assert(!/audio\.src\.startsWith\(['"]blob:['"]\)/.test(fn),
    'handleMusicFile still uses the old audio.src.startsWith("blob:") pattern');
});

test('BUG 32c: handleVideoFile uses setTrackedMediaUrl', () => {
  const fn = get('handleVideoFile').toString();
  assert(/setTrackedMediaUrl\(\s*windowId\s*,\s*['"]video['"]/.test(fn),
    'handleVideoFile must use setTrackedMediaUrl(windowId, "video", ...)');
  assert(!/video\.src\.startsWith\(['"]blob:['"]\)/.test(fn),
    'handleVideoFile still uses the old video.src.startsWith("blob:") pattern');
});

// =================================================================
// Section 10 — Round 5 regression: safeInit still present
// =================================================================
section('Round 5 regression — safeInit helpers still in place');

test('Round 5 regression: safeInit + closingWindowIds still exist', () => {
  assert(typeof get('safeInit') === 'function', 'safeInit missing (Round 5 regression)');
  assert(typeof get('isWindowClosed') === 'function', 'isWindowClosed missing (Round 5 regression)');
});

// =================================================================
// Done
// =================================================================
console.log(`\nRound 6 fixes: ${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
