// Regression tests for Round 7 bug fixes
// (BUG A-G: Notes save-timer flush, unguarded localStorage.setItem in
//  Email/Chat/Clock/2048, Recycle-Bin rollback data loss, snap-to-maximize
//  restore geometry, mobile pull-to-minimize transform, browser/explorer
//  state cleanup)

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
    querySelectorAll(sel) { return []; },
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
      if (sel === '.window' || sel === '.window:not(.minimized)') out.push(el);
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
vm.createContext(sandbox);
vm.runInContext(strippedSrc, sandbox, { filename: 'script.js' });

const get = (k) => sandbox[k];

// =================================================================
// Section 1 — BUG A: Notes save timer is flushed on window close
// =================================================================
section('BUG A — Notes debounce timer flushed before state delete');

test('BUG A1: performWindowCleanup clears + flushes notesSaveTimer', () => {
  const idx = scriptSrc.indexOf('Cleanup Notes state + flush pending save timer');
  const end = scriptSrc.indexOf('delete notesStates[windowId];', idx);
  const block = scriptSrc.slice(idx, end);
  assert(block.length > 50, 'Notes cleanup block not found');
  assert(/clearTimeout\(notesSaveTimer\)/.test(block),
    'cleanup must clearTimeout(notesSaveTimer)');
  assert(/saveNotes\(\)/.test(block),
    'cleanup must call saveNotes() to flush pending changes');
  assert(/notesSaveTimer\s*=\s*null/.test(block),
    'cleanup must reset notesSaveTimer to null');
});

test('BUG A2: scheduleNotesSave debounces via a shared timer', () => {
  const fn = get('scheduleNotesSave').toString();
  assert(/clearTimeout\(notesSaveTimer\)/.test(fn), 'scheduleNotesSave must clear the prior timer');
});

// =================================================================
// Section 2 — BUG B: Email + Chat use quota-safe persistence
// =================================================================
section('BUG B — saveEmails / saveChatMessages use safeStorageSet');

test('BUG B1: saveEmails uses safeStorageSet', () => {
  const fn = get('saveEmails').toString();
  assert(/safeStorageSet\(['"]webos-emails['"],\s*JSON\.stringify\(state\.emails\)\)/.test(fn),
    'saveEmails must call safeStorageSet("webos-emails", ...)');
  assert(!/localStorage\.setItem\(['"]webos-emails['"]\)/.test(fn),
    'saveEmails must not use raw localStorage.setItem');
});

test('BUG B2: saveChatMessages uses safeStorageSet', () => {
  const fn = get('saveChatMessages').toString();
  assert(/safeStorageSet\(['"]webos-chat-messages['"],\s*JSON\.stringify\(state\.messages\)\)/.test(fn),
    'saveChatMessages must call safeStorageSet("webos-chat-messages", ...)');
  assert(!/localStorage\.setItem\(['"]webos-chat-messages['"]\)/.test(fn),
    'saveChatMessages must not use raw localStorage.setItem');
});

// =================================================================
// Section 3 — BUG C: Clock world cities + 2048 high score
// =================================================================
section('BUG C — Clock world cities + 2048 high score are quota-safe');

test('BUG C1: addWorldCity uses safeStorageSet', () => {
  const fn = get('addWorldCity').toString();
  assert(/safeStorageSet\(['"]clockWorldCities['"],\s*JSON\.stringify\(state\.world\.cities\)\)/.test(fn),
    'addWorldCity must use safeStorageSet("clockWorldCities", ...)');
});

test('BUG C2: removeWorldCity uses safeStorageSet', () => {
  const fn = get('removeWorldCity').toString();
  assert(/safeStorageSet\(['"]clockWorldCities['"],\s*JSON\.stringify\(state\.world\.cities\)\)/.test(fn),
    'removeWorldCity must use safeStorageSet("clockWorldCities", ...)');
});

test('BUG C3: 2048 high score write is guarded', () => {
  const fn = get('moveGame2048').toString();
  assert(/safeStorageSet\(['"]2048-best['"],\s*String\(state\.score\)\)/.test(fn),
    '2048 must write high score via safeStorageSet');
});

// =================================================================
// Section 4 — BUG D: Recycle-Bin "restore all" rollback keeps items
// =================================================================
section('BUG D — Recycle-Bin restore-all rollback loses no items');

test('BUG D1: rollback rebuilds full item list (no index arithmetic)', () => {
  const idx = scriptSrc.indexOf('function restoreAllRecycleBinItems');
  const end = scriptSrc.indexOf('function renderRecycleBin', idx);
  const block = scriptSrc.slice(idx, end);
  assert(!/while \(remaining\.length < state\.items\.length\)/.test(block),
    'the broken index-arithmetic loop must be gone');
  assert(/for \(const item of state\.items\) remaining\.push\(item\)/.test(block),
    'rollback must copy every original item back into the bin');
});

test('BUG D2: restore-all keeps every item in the bin on quota failure', () => {
  storage.clear();
  // Simulate: /a.txt and /c.txt were moved to the bin (removed from FS).
  // /b.txt was re-created by the user afterwards -> name conflict on restore.
  vm.runInContext('delete fileSystem["/a.txt"]; delete fileSystem["/b.txt"]; delete fileSystem["/c.txt"]; fileSystem["/b.txt"] = "B (newer)";', sandbox);
  const state = { items: [
    { id: '1', path: '/a.txt', content: 'A', date: 'd1' },
    { id: '2', path: '/b.txt', content: 'B', date: 'd2' },
    { id: '3', path: '/c.txt', content: 'C', date: 'd3' }
  ] };
  vm.runInContext('recycleBinStates["rb-test"] = { items: ' + JSON.stringify(state.items) + ' };', sandbox);
  // Force saveFileSystem to fail (quota)
  const originalSaveFS = get('saveFileSystem');
  sandbox.saveFileSystem = () => false;
  try {
    get('restoreAllRecycleBinItems')('rb-test');
    const remaining = vm.runInContext('recycleBinStates["rb-test"].items', sandbox);
    assert(Array.isArray(remaining), 'state.items must remain an array');
    assert(remaining.length === 3, `all 3 items must stay in the bin, got ${remaining.length}`);
    const paths = remaining.map(i => i.path);
    assert(paths.includes('/a.txt') && paths.includes('/b.txt') && paths.includes('/c.txt'),
      'every original path must remain: ' + paths.join(','));
    // Rollback must have removed the in-memory restores again
    assert(vm.runInContext('fileSystem["/a.txt"]', sandbox) === undefined, '/a.txt must be rolled back out of the FS');
    assert(vm.runInContext('fileSystem["/c.txt"]', sandbox) === undefined, '/c.txt must be rolled back out of the FS');
    // The pre-existing (non-restored) file stays untouched
    assert(vm.runInContext('fileSystem["/b.txt"]', sandbox) === 'B (newer)', '/b.txt conflict file must remain untouched');
  } finally {
    sandbox.saveFileSystem = originalSaveFS;
    vm.runInContext('delete recycleBinStates["rb-test"];', sandbox);
  }
});

// =================================================================
// Section 5 — BUG E: Snap-to-top then maximize restores geometry
// =================================================================
section('BUG E — maximize restore falls back to snapPrev geometry');

test('BUG E1: maximizeWindow restore reads snapPrev* as fallback', () => {
  const fn = get('maximizeWindow').toString();
  assert(/win\.dataset\.prevLeft !== undefined[\s\S]*: win\.dataset\.snapPrevLeft/.test(fn),
    'restore must fall back to snapPrevLeft when prevLeft is unset');
  assert(/win\.dataset\.prevTop !== undefined[\s\S]*: win\.dataset\.snapPrevTop/.test(fn),
    'restore must fall back to snapPrevTop when prevTop is unset');
  assert(/win\.dataset\.prevWidth \|\| win\.dataset\.snapPrevWidth/.test(fn),
    'restore must fall back to snapPrevWidth');
  assert(/win\.dataset\.prevHeight \|\| win\.dataset\.snapPrevHeight/.test(fn),
    'restore must fall back to snapPrevHeight');
});

test('BUG E2: maximize restore consumes snapPrev* keys', () => {
  const fn = get('maximizeWindow').toString();
  assert(/delete win\.dataset\.snapPrevLeft/.test(fn),
    'restore must consume snapPrevLeft after reading it');
});

test('BUG E3: functional restore uses snapPrev geometry', () => {
  const win = makeElWithId('win-e-test');
  win.classList.add('maximized');
  win.dataset.snapPrevLeft = '10px';
  win.dataset.snapPrevTop = '20px';
  win.dataset.snapPrevWidth = '300px';
  win.dataset.snapPrevHeight = '200px';
  get('maximizeWindow')('win-e-test');
  assert(win.classList.contains('maximized') === false, 'window must be un-maximized');
  assert(win.style.left === '10px', `left should be 10px, got ${win.style.left}`);
  assert(win.style.top === '20px', `top should be 20px, got ${win.style.top}`);
  assert(win.style.width === '300px', `width should be 300px, got ${win.style.width}`);
  assert(win.style.height === '200px', `height should be 200px, got ${win.style.height}`);
  delete elementRegistry['win-e-test'];
});

// =================================================================
// Section 6 — BUG F: Mobile pull-to-minimize transform not !important
// =================================================================
section('BUG F — mobile window transform not overridden by !important');

test('BUG F1: mobile .window rule allows inline transform', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  const idx = css.indexOf('@media (max-width: 768px)');
  const mobile = css.slice(idx, css.indexOf('@media', idx + 10));
  const winRule = mobile.slice(mobile.indexOf('    .window {\n'));
  const ruleEnd = winRule.indexOf('\n    }');
  const rule = winRule.slice(0, ruleEnd);
  assert(/transform:\s*none\s*;/.test(rule), 'mobile .window rule must set transform: none');
  assert(!/transform:\s*none\s*!important/.test(rule),
    'transform: none must NOT carry !important (it blocks the drag gesture)');
});

// =================================================================
// Section 7 — BUG G: browser/explorer state cleanup
// =================================================================
section('BUG G — per-window browser + explorer state is released');

test('BUG G1: performWindowCleanup deletes browserStates[windowId]', () => {
  const idx = scriptSrc.indexOf('Cleanup Browser and File Explorer per-window state');
  const endMarker = 'delete explorerStates[windowId];';
  const end = scriptSrc.indexOf(endMarker, idx) + endMarker.length;
  const block = scriptSrc.slice(idx, end);
  assert(/delete browserStates\[windowId\]/.test(block),
    'cleanup must delete browserStates[windowId]');
  assert(/delete explorerStates\[windowId\]/.test(block),
    'cleanup must delete explorerStates[windowId]');
});

test('BUG G2: cleanup also leaves notes/save timer logic intact', () => {
  const fn = get('performWindowCleanup').toString();
  assert(/notesSaveTimer/.test(fn), 'Notes save-timer cleanup must remain in performWindowCleanup');
});

// =================================================================
// Done
// =================================================================
console.log(`\nRound 7 fixes: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
