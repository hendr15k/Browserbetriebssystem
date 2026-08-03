// tests/system-features.js
// Regression/verification tests for the new OS-level features:
//   - virtual desktops (workspaces)
//   - snap layouts (Win+Z style)
//   - quick settings + notification center + system tray
//   - desktop widgets
//   - drag & drop file import into the VFS

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

function makeEl(tag = 'div', id = '') {
  const el = {
    tagName: tag.toUpperCase(),
    id,
    style: {},
    dataset: {},
    children: [],
    attributes: {},
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c, force) {
        const has = this._set.has(c);
        const want = force === undefined ? !has : !!force;
        if (want) this._set.add(c); else this._set.delete(c);
        return want;
      },
      contains(c) { return this._set.has(c); }
    },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {},
    remove() {},
    focus() {},
    addEventListener() {},
    removeEventListener() {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    removeAttribute(k) { delete this.attributes[k]; },
    getAttribute(k) { return this.attributes[k] || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 200, bottom: 40, width: 200, height: 40 }; },
    closest() { return null; },
    get innerHTML() { return this._innerHTML || ''; },
    set innerHTML(v) { this._innerHTML = String(v); this.children.length = 0; },
    textContent: '',
    value: ''
  };
  return el;
}

const registry = {};
const windows = [];
function reg(el) { registry[el.id] = el; return el; }
function makeWindow(id, workspace) {
  const w = makeEl('div', id);
  w.dataset.workspace = String(workspace);
  w.classList.add('window');
  windows.push(w);
  reg(w);
  return w;
}

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) { return registry[id] || null; },
  querySelectorAll(sel) {
    if (sel === '.window') return windows.slice();
    if (sel.startsWith('.window[data-workspace=')) return [];
    return [];
  },
  querySelector() { return null; },
  createElement(tag) { return makeEl(tag); },
  body: makeEl('body', 'body'),
  head: makeEl('head', 'head'),
  documentElement: makeEl('html', 'html'),
  activeElement: null
};

class FakeFileReader {
  constructor() { this.onload = null; this.onerror = null; }
  readAsText(file) {
    const result = (file._text !== undefined) ? file._text : 'hello world';
    setTimeout(() => this.onload && this.onload({ target: { result } }), 0);
  }
  readAsDataURL(file) {
    setTimeout(() => this.onload && this.onload({ target: { result: 'data:application/octet-stream;base64,AAAA' } }), 0);
  }
}

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener() {},
  removeEventListener() {},
  setTimeout, clearTimeout, setInterval, clearInterval,
  localStorage: storage,
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  navigator: { userAgent: 'node-test', clipboard: { writeText() { return Promise.resolve(); } } },
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  screen: { width: 1920, height: 1080 }
};

global.localStorage = storage;
global.performance = global.window.performance;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;
global.navigator = global.window.navigator;
global.FileReader = FakeFileReader;

// ---------- Test framework ----------
let passed = 0, failed = 0;
const queue = [];
function assert(cond, msg) {
  if (!cond) {
    throw new Error('Assertion failed: ' + (msg || '(no msg)'));
  }
}
function test(name, fn) { queue.push({ name, fn }); }
function section(s) { console.log(`\n--- ${s} ---`); }

// ---------- Load script.js ----------
const vm = require('vm');
const scriptSrc = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
// Strip the top-level immediate updateClock() call (needs real DOM clock el)
const strippedSrc = scriptSrc.replace(
  /^(\s*updateClock\(\);\s*)$/m,
  '/* stripped for tests */\n'
);

const sandbox = {
  ...global,
  document,
  window,
  localStorage: storage,
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  alert: () => {},
  confirm: () => true,
  showNotification: () => {},
  process: { env: {} }
};
vm.createContext(sandbox);
vm.runInContext(strippedSrc, sandbox, { filename: 'script.js' });

const get = (k) => sandbox[k];
// `let`/`const` bindings live in the vm context's lexical scope and are not
// reachable via the sandbox object — read them through a second script.
function wsList() { return vm.runInContext('workspaces', sandbox); }
function wsCurrent() { return vm.runInContext('currentWorkspace', sandbox); }
function qsGet() { return vm.runInContext('quickSettings', sandbox); }

// =================================================================
// Section 1 — Virtual desktops
// =================================================================
section('Virtual desktops (workspaces)');

test('workspaces: loadWorkspaceState creates one default desktop on fresh load', () => {
  get('loadWorkspaceState')();
  assert(Array.isArray(wsList()) && wsList().length === 1,
    'exactly one default workspace expected');
  assert(wsCurrent() === 0, 'currentWorkspace should start at 0');
});

test('workspaces: addWorkspace appends a desktop and persists', () => {
  get('addWorkspace')();
  const ws = wsList();
  assert(ws.length === 2, 'addWorkspace should create a second desktop');
  assert(/Desktop 2/.test(ws[1].name), 'second desktop should be named "Desktop 2"');
  const saved = JSON.parse(storage.getItem('webos-workspaces'));
  assert(Array.isArray(saved.list) && saved.list.length === 2, 'workspaces persisted to localStorage');
});

test('workspaces: windowIsOnCurrentWorkspace reflects dataset', () => {
  const w = makeWindow('win-test-a', 0);
  assert(get('windowIsOnCurrentWorkspace')(w) === true, 'workspace-0 window is on current workspace (0)');
  w.dataset.workspace = '1';
  assert(get('windowIsOnCurrentWorkspace')(w) === false, 'workspace-1 window is NOT on current workspace (0)');
  w.dataset.workspace = '0';
});

test('workspaces: switchWorkspace hides windows of other desktops', () => {
  const w0 = makeWindow('win-ws-a', 0);
  const w1 = makeWindow('win-ws-b', 1);
  get('switchWorkspace')(1, true);
  assert(wsCurrent() === 1, 'currentWorkspace moved to 1');
  assert(w1.style.display === 'flex' || w1.style.display === '', 'workspace-1 window visible on desktop 1');
  assert(w0.style.display === 'none', 'workspace-0 window hidden on desktop 1');
  assert(w0.dataset.wsHidden === '1', 'hidden window flagged with wsHidden');
  get('switchWorkspace')(0, true);
  assert(w0.style.display === 'flex' || w0.style.display === '', 'workspace-0 window visible again on desktop 0');
});

test('workspaces: removeWorkspace refuses to delete the last desktop', () => {
  const ws = wsList();
  while (ws.length > 1) get('removeWorkspace')(ws.length - 1);
  const count = wsList().length;
  get('removeWorkspace')(0);
  assert(wsList().length === count, 'last desktop cannot be deleted');
});

test('workspaces: taskbar buttons survive workspace switch (no throw)', () => {
  const fn = get('refreshWorkspaceVisibility');
  fn();
  assert(true, 'refreshWorkspaceVisibility ran without throwing');
});

// =================================================================
// Section 2 — Snap layouts (Win+Z)
// =================================================================
section('Snap layouts (Win+Z style)');

test('snap-layout: two columns split the viewport in half', () => {
  const r = get('snapLayoutRect')(0, 0);
  assert(Math.abs(r.w - 512) <= 1, `left column width ~512, got ${r.w}`);
  const r2 = get('snapLayoutRect')(0, 1);
  assert(Math.abs(r2.x - 512) <= 1, `right column starts at ~512, got ${r2.x}`);
  assert(r.h === r2.h, 'both columns share the full height');
});

test('snap-layout: three columns split into thirds', () => {
  const r = get('snapLayoutRect')(1, 1);
  assert(Math.abs(r.w - 341.333) < 2, `middle third width ~341, got ${r.w}`);
  assert(Math.abs(r.x - 341.333) < 2, `middle third starts at ~341, got ${r.x}`);
});

test('snap-layout: quadrants give four quarters', () => {
  const tl = get('snapLayoutRect')(2, 0);
  const br = get('snapLayoutRect')(2, 3);
  assert(Math.abs(tl.w - 512) < 2, 'quadrant width is half the viewport');
  assert(Math.abs(br.x - 512) < 2 && Math.abs(br.y - 360) <= 2, 'bottom-right quadrant offset correctly');
});

test('snap-layout: applySnapLayout sets geometry and focuses window', () => {
  const w = makeWindow('win-snap', 0);
  const r = get('snapLayoutRect')(0, 1);
  get('applySnapLayout')('win-snap', r);
  assert(parseInt(w.style.width, 10) === 512, 'applySnapLayout set width');
  assert(parseInt(w.style.left, 10) === 512, 'applySnapLayout set left offset');
});

test('snap-layout: layout definitions are rendered (4 options)', () => {
  const defs = vm.runInContext('SNAP_LAYOUT_DEFS', sandbox);
  assert(Array.isArray(defs) && defs.length === 4, 'four snap layout definitions exist');
});

// =================================================================
// Section 3 — Quick settings + notification center + tray
// =================================================================
section('Quick settings + notification center');

test('quick-settings: defaults are sane', () => {
  const qs = qsGet();
  assert(qs.wifi === true && qs.sound === true, 'wifi + sound enabled by default');
  assert(qs.dnd === false, 'do-not-disturb disabled by default');
});

test('quick-settings: toggleQuickSetting flips state and persists', () => {
  get('toggleQuickSetting')('wifi');
  assert(qsGet().wifi === false, 'wifi toggled off');
  const saved = JSON.parse(storage.getItem('webos-quick-settings'));
  assert(saved.wifi === false, 'quick settings persisted after toggle');
  get('toggleQuickSetting')('wifi');
  assert(qsGet().wifi === true, 'wifi toggled back on');
});

test('quick-settings: DND flag propagates to window', () => {
  get('toggleQuickSetting')('dnd');
  assert(sandbox.window.webosDndEnabled === true, 'webosDndEnabled true when DND on');
  get('toggleQuickSetting')('dnd');
  assert(sandbox.window.webosDndEnabled === false, 'webosDndEnabled false when DND off');
});

test('quick-settings: applyQuickSettings sets data-theme attribute', () => {
  vm.runInContext('quickSettings.darkmode = false', sandbox);
  get('applyQuickSettings')();
  assert(sandbox.document.documentElement.attributes['data-theme'] === 'light', 'light theme applied');
  vm.runInContext('quickSettings.darkmode = true', sandbox);
  get('applyQuickSettings')();
  assert(sandbox.document.documentElement.attributes['data-theme'] === 'dark', 'dark theme restored');
});

test('notification-center: renders history into the list', () => {
  const container = reg(makeEl('div', 'qs-notif-list'));
  reg(makeEl('div', 'qs-notif-empty'));
  reg(makeEl('span', 'qs-open-badge'));
  sandbox.window.webosNotificationHistory = [
    { title: 'T1', message: 'M1', time: Date.now() },
    { title: 'T2', message: 'M2', time: Date.now() }
  ];
  get('renderNotificationHistory')();
  assert(container.children.length === 2, 'two notification items rendered');
  assert(container.children[0].children.length >= 1, 'notification item has body content');
  assert(sandbox.document.getElementById('qs-open-badge').classList.contains('hidden') === false,
    'open badge visible when notifications exist');
});

test('notification-center: clearNotificationHistory empties the list', () => {
  get('clearNotificationHistory')();
  const container = sandbox.document.getElementById('qs-notif-list');
  assert(container.children.length === 0, 'notification list cleared');
  const badge = sandbox.document.getElementById('qs-open-badge');
  assert(badge.classList.contains('hidden') === true, 'open badge hidden after clear');
});

test('notification-center: webosOnNewNotification hook exists', () => {
  assert(typeof get('webosOnNewNotification') === 'function', 'webosOnNewNotification helper present');
});

// =================================================================
// Section 4 — Desktop widgets
// =================================================================
section('Desktop widgets');

test('widgets: weather code mapping covers common cases', () => {
  const e = get('weatherCodeToEmoji');
  const d = get('weatherCodeToDesc');
  assert(e(0) === '☀️', 'clear sky maps to sun emoji');
  assert(d(0) === 'Klar', 'clear sky description');
  assert(e(61) === '🌧️', 'rain maps to rain emoji');
  assert(d(95) === 'Gewitter', 'thunderstorm description');
});

test('widgets: applyWeather updates DOM fields', () => {
  reg(makeEl('div', 'widget-weather'));
  reg(makeEl('span', 'w-emoji'));
  reg(makeEl('span', 'w-temp'));
  reg(makeEl('div', 'w-desc'));
  reg(makeEl('div', 'w-city'));
  get('applyWeather')({ temp: '21°C', code: 1, wind: 12, name: 'Teststadt' });
  assert(sandbox.document.getElementById('w-temp').textContent === '21°C', 'temperature rendered');
  assert(sandbox.document.getElementById('w-city').textContent === 'Teststadt', 'city name rendered');
});

test('widgets: buildClockWidget produces a live clock node', () => {
  const container = makeEl('div', 'widgets-container');
  get('buildClockWidget')(container);
  assert(container.children.length === 1, 'clock widget appended');
});

// =================================================================
// Section 5 — Drag & drop file import
// =================================================================
section('Drag & drop file import');

test('dragdrop: text files are imported as plain text into the VFS', async () => {
  const vfs = sandbox.window.fileSystem;
  const fsBefore = Object.keys(vfs).length;
  const files = [{ name: 'dropped.txt', type: 'text/plain', _text: 'hello from drop' }];
  get('handleDroppedFiles')(files);
  await new Promise(r => setTimeout(r, 25));
  assert(vfs['dropped.txt'] === 'hello from drop', 'text file stored as plain text');
  assert(Object.keys(vfs).length === fsBefore + 1, 'file count incremented');
});

test('dragdrop: binary files are stored as data URLs', async () => {
  const vfs = sandbox.window.fileSystem;
  const files = [{ name: 'img.bin', type: 'application/octet-stream' }];
  get('handleDroppedFiles')(files);
  await new Promise(r => setTimeout(r, 25));
  assert(String(vfs['img.bin']).startsWith('data:'), 'binary file stored as data URL');
});

// =================================================================
// Done
// =================================================================
async function runAll() {
  for (const t of queue) {
    try {
      await t.fn();
      passed++;
      console.log(`[PASS] ${t.name}`);
    } catch (e) {
      failed++;
      console.error(`[FAIL] ${t.name}: ${e.message}`);
    }
  }
  console.log(`\nSystem Features: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

runAll();
