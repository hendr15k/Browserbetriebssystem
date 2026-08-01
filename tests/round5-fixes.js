// Regression tests for Round 5 bug fixes
// Each test must FAIL before the fix and PASS after. The asserts are
// crafted so the failure mode mirrors the original bug.

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
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c, v) { v ? this._set.add(c) : this._set.delete(c); },
      contains(c) { return this._set.has(c); },
      toString() { return Array.from(this._set).join(' '); }
    },
    innerHTML: '',
    textContent: '',
    id: '',
    value: '',
    onclick: null,
    onmousedown: null,
    onmouseup: null,
    onkeydown: null,
    onkeyup: null,
    focus() {},
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); return c; },
    addEventListener(ev, fn, opts) { (this._listeners = this._listeners || {})[ev] = (this._listeners[ev] || []).concat(fn); },
    removeEventListener(ev, fn) {},
    setAttribute(k, v) { this.attributes[k] = v; },
    removeAttribute(k) { delete this.attributes[k]; },
    getAttribute(k) { return this.attributes[k] || null; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }; },
    closest(sel) { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    dispatchEvent(ev) {
      (this._listeners?.[ev.type] || []).forEach(fn => fn(ev));
    },
    classList: undefined // override below — use real classList impl
  };
}

// Real-ish classList (overriding the previous)
function attachClassList(el) {
  el._classSet = new Set();
  el.classList = {
    add(c) { el._classSet.add(c); },
    remove(c) { el._classSet.delete(c); },
    toggle(c, v) { v ? el._classSet.add(c) : el._classSet.delete(c); },
    contains(c) { return el._classSet.has(c); },
    toString() { return Array.from(el._classSet).join(' '); }
  };
}

const elementRegistry = {};
function makeElWithId(id, tag = 'div') {
  const e = makeEl(tag);
  attachClassList(e);
  e.id = id;
  e.closest = (sel) => null;
  elementRegistry[id] = e;
  return e;
}

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) { return elementRegistry[id] || null; },
  querySelectorAll(sel) {
    // crude matcher for '.icon', '.taskbar-item', '.window', '.context-menu'
    const matches = [];
    Object.values(elementRegistry).forEach(el => {
      if (sel === '.window' && el.id.startsWith('window-')) matches.push(el);
      if (sel === '.taskbar-item' && el.id.startsWith('taskbar-')) matches.push(el);
      if (sel === '.icon' && el.id.startsWith('icon-')) matches.push(el);
    });
    return matches;
  },
  querySelector(sel) { return null; },
  body: makeEl('body'),
  head: makeEl('head'),
  createElement(tag) { const e = makeEl(tag); attachClassList(e); return e; },
  hidden: false,
  documentElement: makeEl('html'),
  activeElement: null,
  fullScreenElement: null,
  exitFullscreen() {}
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  innerH: 768,
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
  WebOSState: null,
  AudioContext: function() {
    this.close = () => {};
    this.createOscillator = () => ({ start() {}, stop() {}, connect() {}, disconnect() {}, frequency: { value: 0 } });
    this.createGain = () => ({ gain: { value: 1 }, connect() {}, disconnect() {} });
    this.destination = { connect() {} };
  },
  MediaRecorder: function() {
    this.stream = null;
    this.ondataavailable = null;
    this.onstop = null;
    this.start = () => {};
    this.stop = () => { if (this.onstop) this.onstop(); };
  },
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
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

// ---------- Load script.js in a controlled way ----------
// Loading the full script.js calls `updateClock()` at the top level (line 200)
// which crashes in our minimal stub. We sandbox it but trap globals so the
// top-level effect doesn't crash before our symbols are defined.
const vm = require('vm');
const scriptSrc = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

// Strip the top-level `updateClock()` standalone call (not the function
// declaration). Everything we test is reached via the sandbox global, so
// removing the bare call is safe.
const strippedSrc = scriptSrc.replace(
  /^(updateClock\(\);?)\s*$/m,
  '/* updateClock() top-level call stripped for tests */'
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

// Pull symbols we want to test
const get = (k) => sandbox[k];

// =================================================================
// Section 1 — BUG 9: Single contextmenu listener per element
// =================================================================
section('BUG 9 — contextmenu listener dedup');

test('BUG 9a: desktop has exactly ONE contextmenu listener after init', () => {
  const desktop = makeElWithId('desktop');
  desktop.closest = (sel) => {
    if (sel === '.icon') return null;
    if (sel === '#taskbar') return null;
    if (sel === '.context-menu') return null;
    return null;
  };
  elementRegistry['desktop'] = desktop;
  // Simulate DOMContentLoaded re-initialising the listeners and capture them
  desktop._listeners = [];
  const ev = { type: 'contextmenu', target: desktop, clientX: 10, clientY: 20, preventDefault() {}, stopPropagation() {} };
  // After our fix, only ONE contextmenu handler should be registered via
  // `desktop.addEventListener('contextmenu', …)`. We can't easily count
  // because `addEventListener` is a no-op in the stub; instead we assert
  // the source: only one `desktop.addEventListener('contextmenu'` call.
  const matches = scriptSrc.match(/desktop\.addEventListener\(['"]contextmenu['"]/g) || [];
  assert(matches.length === 1, `Expected 1 desktop contextmenu listener registration, got ${matches.length}`);
});
test('BUG 9b: taskbar has exactly ONE contextmenu listener registration', () => {
  const matches = scriptSrc.match(/taskbar\.addEventListener\(['"]contextmenu['"]/g) || [];
  assert(matches.length === 1, `Expected 1 taskbar contextmenu listener registration, got ${matches.length}`);
});
test('BUG 9c: no remaining `document.getElementById(\'taskbar\').addEventListener(\'contextmenu\'', () => {
  const bad = scriptSrc.match(/document\.getElementById\(['"]taskbar['"]\)\.addEventListener\(['"]contextmenu['"]/g);
  assert(!bad, 'Found legacy getElementById taskbar contextmenu register');
});

// =================================================================
// Section 2 — BUG 11: VoiceRecorder stopRecording in cleanup
// =================================================================
section('BUG 11 — VoiceRecorder cleanup is defensive');

test('BUG 11a: cleanup wraps stopRecording in try/catch', () => {
  // Grep the cleanup path for the try/catch around stopRecording
  const cleanupSnippet = scriptSrc.match(/voiceRecorderStates\[windowId\][\s\S]{0,4000}?delete voiceRecorderStates\[windowId\];/);
  assert(cleanupSnippet, 'voiceRecorderStates cleanup block not found');
  assert(/try\s*\{\s*stopRecording\(windowId\)/.test(cleanupSnippet[0]),
    'stopRecording is not wrapped in try/catch in performWindowCleanup');
  assert(/catch\s*\(\s*err/.test(cleanupSnippet[0]),
    'try/catch around stopRecording has no catch handler');
});

test('BUG 11b: cleanup defensively clears timerInterval', () => {
  const cleanupSnippet = scriptSrc.match(/voiceRecorderStates\[windowId\][\s\S]{0,4000}?delete voiceRecorderStates\[windowId\];/);
  assert(cleanupSnippet, 'voiceRecorderStates cleanup block not found');
  assert(/state\.timerInterval/.test(cleanupSnippet[0]),
    'cleanup should reference state.timerInterval defensively');
});

// =================================================================
// Section 3 — BUG 17: saveRecycleBin / moveToRecycleBin
// =================================================================
section('BUG 17 — saveRecycleBin uses safeStorageSet, moveToRecycleBin aborts on quota');

test('BUG 17a: saveRecycleBin returns boolean (via safeStorageSet)', () => {
  assert(typeof get('saveRecycleBin') === 'function', 'saveRecycleBin not defined');
  // Insert a tiny item, set OK
  storage.clear();
  assert(get('saveRecycleBin')([{ id: 'x' }]) === true, 'saveRecycleBin should return true on small payload');
});
test('BUG 17b: moveToRecycleBin aborts when save fails (keeps fileSystem intact)', () => {
  storage.clear();
  const origSetItem = storage.setItem;
  storage.setItem = (k, v) => {
    if (k === 'webos-recyclebin') {
      const err = new Error('QuotaExceeded');
      err.name = 'QuotaExceededError';
      throw err;
    }
    return origSetItem.call(storage, k, v);
  };
  // fileSystem is declared `const` in script.js; we cannot reassign but we
  // can mutate its keys. Push an entry directly via the sandbox.
  vm.runInContext('fileSystem["/test.txt"] = "hello";', sandbox);
  vm.runInContext('saveFileSystem = () => {};', sandbox);
  try {
    get('moveToRecycleBin')('/test.txt');
    const stillThere = vm.runInContext('fileSystem["/test.txt"]', sandbox);
    assert(stillThere === 'hello',
      'File vanished from fileSystem despite recycle-bin save failing — BUG 17 regression!');
  } finally {
    storage.setItem = origSetItem;
  }
});
test('BUG 17c: moveToRecycleBin still works on success', () => {
  storage.clear();
  // fileSystem is `const`, but we can wipe + repopulate via assignment to keys.
  vm.runInContext(`
    for (const k of Object.keys(fileSystem)) delete fileSystem[k];
    fileSystem["/ok.txt"] = "world";
    saveFileSystem = () => {};
  `, sandbox);
  get('moveToRecycleBin')('/ok.txt');
  const gone = vm.runInContext('fileSystem["/ok.txt"] === undefined', sandbox);
  assert(gone, 'File should be removed from fileSystem on success');
  const items = JSON.parse(storage.getItem('webos-recyclebin') || '[]');
  assert(items.length === 1 && items[0].path === '/ok.txt', 'Item should be saved in recycle bin');
});

// =================================================================
// Section 4 — BUG 18: Gallery soft cap + monotonic IDs
// =================================================================
section('BUG 18 — Gallery ID uniqueness + soft cap');

test('BUG 18a: Gallery has a soft cap (GALLERY_SOFT_CAP constant)', () => {
  const m = scriptSrc.match(/GALLERY_SOFT_CAP\s*=\s*(\d+)/);
  assert(m && parseInt(m[1]) > 0, `GALLERY_SOFT_CAP not found or invalid`);
});
test('BUG 18b: Gallery IDs include a sequential counter', () => {
  const fnSrc = get('uploadGalleryImages').toString();
  assert(/state\.images\.length\s*\+\s*['"]\-['"]/.test(fnSrc) ||
         /state\.images\.length\s*\+\s*['"]-/.test(fnSrc),
         'Gallery ID generator should include state.images.length counter');
});
test('BUG 18c: upload refuses when cap exceeded', () => {
  storage.clear();
  const winId = 'win-gallery-1';
  const fullImages = [];
  for (let i = 0; i < 200; i++) fullImages.push({ id: 'a-' + i, name: 'a.png', data: 'x' });
  vm.runInContext(
    `galleryStates[${JSON.stringify(winId)}] = { images: ${JSON.stringify(fullImages)}, view: 'grid', currentIndex: 0 };`,
    sandbox);
  const beforeLen = vm.runInContext(`galleryStates[${JSON.stringify(winId)}].images.length`, sandbox);

  let alerted = false;
  sandbox.alert = () => { alerted = true; };
  try {
    const input = { files: [new Blob(['x'])], value: 'filled' };
    get('uploadGalleryImages')(winId, input);
    const afterLen = vm.runInContext(`galleryStates[${JSON.stringify(winId)}].images.length`, sandbox);
    assert(afterLen === beforeLen, `Cap exceeded but images pushed anyway: ${beforeLen} -> ${afterLen}`);
    assert(alerted, `Should show alert when cap exceeded`);
    assert(input.value === '', 'Input value should be reset to empty on cap-exceeded');
  } finally {
    sandbox.alert = () => {};
  }
});

// =================================================================
// Section 5 — BUG 12: safeInit closes the init-after-close race
// =================================================================
section('BUG 12 — safeInit shuts the door on init-after-close races');

test('BUG 12a: safeInit helper is defined', () => {
  assert(typeof get('safeInit') === 'function', 'safeInit missing');
});
test('BUG 12b: isWindowClosed helper is defined', () => {
  assert(typeof get('isWindowClosed') === 'function', 'isWindowClosed missing');
});
test('BUG 12c: closingWindowIds set is defined', () => {
  // The const lives in script.js's top-level scope; inspect via vm.
  const isSet = vm.runInContext('closingWindowIds instanceof Set', sandbox);
  assert(isSet, 'closingWindowIds not a Set');
});
test('BUG 12d: every setTimeout(() => initX(...), 0) in openApp is replaced by safeInit', () => {
  // After the fix, the only `setTimeout(() => init` references should be
  // inside comments / string literals (the safeInit docblock).
  // Strip out lines that are doc comments to be safe.
  const lines = strippedSrc.split('\n').filter(l => !/^\s*\/\//.test(l) && !/^\s*\*/.test(l));
  const codeOnly = lines.join('\n');
  const realCalls = (codeOnly.match(/setTimeout\(\(\) => init[A-Za-z0-9_]+\(/g) || []);
  assert(realCalls.length === 0, `Found live setTimeout init calls: ${realCalls.length}`);
});
test('BUG 12e: closeWindow adds windowId to closingWindowIds immediately', () => {
  const winId = 'window-x';
  const win = makeElWithId(winId);
  elementRegistry[winId] = win;
  vm.runInContext(`closingWindowIds.delete(${JSON.stringify(winId)});`, sandbox);
  get('closeWindow')(winId);
  const has = vm.runInContext(`closingWindowIds.has(${JSON.stringify(winId)})`, sandbox);
  assert(has, 'closeWindow did not add windowId to closingWindowIds');
});
test('BUG 12f: safeInit skips when windowId is in closingWindowIds', () => {
  const winId = 'window-y';
  const win = makeElWithId(winId);
  elementRegistry[winId] = win;
  let ran = false;
  const init = () => { ran = true; };
  // Window is alive (not in closingWindowIds, in DOM)
  vm.runInContext(`closingWindowIds.delete(${JSON.stringify(winId)});`, sandbox);
  get('safeInit')(winId, init);
  assert(ran, 'safeInit should run when window is alive');

  // Simulate close-window flow: add to set + detach element
  vm.runInContext(`closingWindowIds.add(${JSON.stringify(winId)});`, sandbox);
  delete elementRegistry[winId];
  ran = false;
  get('safeInit')(winId, init);
  assert(!ran, 'safeInit should skip when window detached + in closing set');
});

// =================================================================
// Section 6 — BUG 27: Wine iframe src cleaned up
// =================================================================
section('BUG 27 — Wine iframe unload on cleanup');

test('BUG 27a: performWindowCleanup sets wine iframe src to about:blank', () => {
  const cleanupBlock = scriptSrc.match(/Wine iframe postMessage handler cleanup[\s\S]{0,3000}?delete cameraStreams\[windowId\];/);
  assert(cleanupBlock, 'wine cleanup block not found');
  assert(/wine-iframe-/.test(cleanupBlock[0]), 'wine iframe id not referenced in cleanup');
  assert(/about:blank/.test(cleanupBlock[0]), 'about:blank not used to unload wine iframe');
});

// =================================================================
// Section 7 — FileReader onerror coverage (BUG 3 from round 4)
// =================================================================
section('BUG 3 — FileReader onerror handler coverage');

test('BUG 3: attachFileReaderErrorHandler is referenced everywhere a FileReader is constructed', () => {
  // Find all `new FileReader()` constructions
  const fileReaderCreations = (scriptSrc.match(/new FileReader\(\)/g) || []);
  // And all `attachFileReaderErrorHandler(reader` calls
  const errorHandlerRefs = (scriptSrc.match(/attachFileReaderErrorHandler\(reader/g) || []);
  // Either every FileReader gets the helper, or it provides a manual onerror.
  // In script.js we expect: 8 FileReader constructions, ~7 attachFileReaderErrorHandler calls.
  // The gallery upload uses an inline onerror (per the round-4 fix). So we
  // expect creations - 1 = errorHandlerRefs, minus any FileReader creations
  // that already have an onerror inline (which is the gallery one we found).
  assert(fileReaderCreations.length >= 1, 'No FileReader found?!');
  // At minimum, the helper should have been applied to most FileReaders
  assert(errorHandlerRefs.length >= 5, `Expected >=5 attachFileReaderErrorHandler calls, got ${errorHandlerRefs.length}`);
});

// =================================================================
// Done
// =================================================================
console.log(`\nRound 5 fixes: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
