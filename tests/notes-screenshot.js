// tests/notes-screenshot.js
// Verification tests for the new Notes app and the Screenshot tool.

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
function reg(el) { registry[el.id] = el; return el; }

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) { return registry[id] || null; },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  createElement(tag) { return makeEl(tag); },
  body: makeEl('body', 'body'),
  head: makeEl('head', 'head'),
  documentElement: makeEl('html', 'html'),
  activeElement: null
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  scrollX: 0,
  scrollY: 0,
  addEventListener() {},
  removeEventListener() {},
  setTimeout, clearTimeout, setInterval, clearInterval,
  localStorage: storage,
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  navigator: { userAgent: 'node-test' },
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

// ---------- Test framework ----------
let passed = 0, failed = 0;
const queue = [];
function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + (msg || '(no msg)'));
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
function notesState() { return vm.runInContext('notesStates', sandbox); }
function appData() { return vm.runInContext('appData', sandbox); }
function appCategories() { return vm.runInContext('appCategories', sandbox); }
function screenshotState() { return vm.runInContext('screenshotState', sandbox); }

// =================================================================
// Section 1 — Notes app registration
// =================================================================
section('Notes app registration');

test('notes: appData contains a notes entry', () => {
  const ad = appData();
  assert(ad && ad.notes, 'appData.notes should exist');
  assert(ad.notes.name === 'Notes', 'notes app name is "Notes"');
});

test('notes: appCategories.productivity includes notes', () => {
  const cats = appCategories();
  assert(cats.productivity.includes('notes'), 'productivity category includes notes');
});

test('notes: openApp builds a notes window with toolbar + sidebar', () => {
  const area = makeEl('div', 'window-area');
  reg(area);
  reg(makeEl('div', 'taskbar-apps'));
  get('openApp')('notes', null, { id: 'win-notes-test' });
  const win = area.children[0];
  assert(win, 'a window element was appended to window-area');
  assert(win.classList.contains('notes-window'), 'window has notes-window class');
  assert(/notes-toolbar/.test(win.innerHTML), 'content includes notes-toolbar');
  assert(/notes-sidebar/.test(win.innerHTML), 'content includes notes-sidebar');
  assert(/notes-editor/.test(win.innerHTML), 'content includes notes-editor');
});

// =================================================================
// Section 2 — Notes logic
// =================================================================
section('Notes logic');

test('notes: loadNotes returns [] on fresh storage', () => {
  storage.clear();
  const notes = get('loadNotes')();
  assert(Array.isArray(notes) && notes.length === 0, 'fresh storage yields empty array');
});

test('notes: createNote adds a note and selects it', () => {
  const winId = 'win-notes-a';
  get('initNotes')(winId);
  get('createNote')(winId);
  const st = notesState()[winId];
  assert(st && st.notes.length === 1, 'one note created');
  assert(st.selectedId === st.notes[0].id, 'new note is selected');
});

test('notes: updateNoteText persists title and content', () => {
  const winId = 'win-notes-b';
  get('initNotes')(winId);
  get('createNote')(winId);
  const st = notesState()[winId];
  const id = st.selectedId;
  const titleEl = makeEl('input', `notes-title-${winId}`);
  const taEl = makeEl('textarea', `notes-textarea-${winId}`);
  titleEl.value = 'Meine Notiz';
  taEl.value = '## Titel\n- Punkt 1';
  reg(titleEl); reg(taEl);
  get('updateNoteText')(winId, id);
  const note = st.notes.find(n => n.id === id);
  assert(note.title === 'Meine Notiz', 'title updated');
  assert(note.content === '## Titel\n- Punkt 1', 'content updated');
});

test('notes: filterNotes filters by category', () => {
  const winId = 'win-notes-c';
  get('initNotes')(winId);
  get('createNote')(winId);
  const st = notesState()[winId];
  const id = st.selectedId;
  get('setNoteCategory')(winId, id, 'Work');
  const filterSel = makeEl('select', `notes-filter-select-${winId}`);
  filterSel.value = 'Work';
  reg(filterSel);
  get('filterNotes')(winId);
  assert(st.filter === 'Work', 'filter state updated to Work');
});

test('notes: saveNotes writes to localStorage', () => {
  storage.clear();
  const winId = 'win-notes-d';
  get('initNotes')(winId);
  get('createNote')(winId);
  get('saveNotes')();
  const saved = JSON.parse(storage.getItem('webos-notes'));
  assert(Array.isArray(saved) && saved.length >= 1, 'notes persisted to localStorage');
});

test('notes: renderMarkdown renders headings, lists and code', () => {
  const md = get('renderMarkdown');
  const out = md('# Hallo\n\n- eins\n- zwei\n\n```js\nvar x = 1;\n```');
  assert(/<h1>Hallo<\/h1>/.test(out), 'heading rendered');
  assert(/<li>eins<\/li>/.test(out), 'list item rendered');
  assert(/<pre><code>/.test(out), 'code block rendered');
});

test('notes: renderMarkdown escapes HTML (XSS safety)', () => {
  const md = get('renderMarkdown');
  const out = md('<script>alert(1)</script>');
  assert(!/<script>/.test(out), 'raw script tag is escaped');
  assert(/&lt;script&gt;/.test(out), 'script tag escaped as entities');
});

test('notes: cleanup removes state from notesStates', () => {
  const winId = 'win-notes-e';
  get('initNotes')(winId);
  assert(notesState()[winId], 'state exists before cleanup');
  get('performWindowCleanup')(winId);
  assert(!notesState()[winId], 'state removed after cleanup');
});

// =================================================================
// Section 3 — Screenshot tool
// =================================================================
section('Screenshot tool');

test('screenshot: openScreenshotTool and startScreenshotSelection exist', () => {
  assert(typeof get('openScreenshotTool') === 'function', 'openScreenshotTool is a function');
  assert(typeof get('startScreenshotSelection') === 'function', 'startScreenshotSelection is a function');
});

test('screenshot: buildScreenshotSvg wraps HTML in foreignObject and escapes', () => {
  const build = get('buildScreenshotSvg');
  const svg = build('<div>&</div>', 100, 50);
  assert(/<foreignObject/.test(svg), 'contains foreignObject');
  assert(/&lt;div&gt;/.test(svg), 'html is escaped inside svg');
  assert(/&amp;/.test(svg), 'ampersand escaped');
});

test('screenshot: getScreenshotRect clamps to overlay bounds', () => {
  const st = screenshotState();
  st.active = true;
  st.overlay = { clientWidth: 1000, clientHeight: 700 };
  st.startX = -50; st.startY = -50; st.currentX = 1100; st.currentY = 800;
  const r = get('getScreenshotRect')();
  assert(r.x === 0, 'x clamped to 0');
  assert(r.y === 0, 'y clamped to 0');
  assert(r.w === 1000, 'width clamped to overlay width');
  assert(r.h === 700, 'height clamped to overlay height');
  st.active = false;
  st.overlay = null;
});

test('screenshot: startScreenshotSelection builds overlay and cancels cleanly', () => {
  get('startScreenshotSelection')();
  const st = screenshotState();
  assert(st.active === true, 'screenshot state active after start');
  get('cancelScreenshot')();
  assert(st.active === false, 'screenshot state inactive after cancel');
});

test('screenshot: keydown handler cancels on Escape', () => {
  get('startScreenshotSelection')();
  const st = screenshotState();
  get('handleScreenshotKeydown')({ key: 'Escape', preventDefault() {}, stopPropagation() {} });
  assert(st.active === false, 'Escape cancels the capture');
});

// =================================================================
// Run
// =================================================================
section('Run');
queue.forEach(({ name, fn }) => {
  try {
    fn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (e) {
    failed++;
    console.log(`[FAIL] ${name} — ${e.message}`);
  }
});
console.log(`\nNotes + Screenshot Tests Complete: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
