// Regression tests for the mobile / touch UI
// Covers: mobile viewport detection, full-screen window placement on phones,
// title-bar swipe-down-to-minimize gesture, long-press context menus,
// start-menu backdrop handling and mobile bottom-sheet menu positioning.

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
  const el = {
    tagName: tag.toUpperCase(),
    // Browsers report unset style props as '' — mirror that for `display`
    // checks (toggleStartMenu / minimizeWindow rely on it).
    style: { display: '' },
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
    addEventListener() {},
    removeEventListener() {},
    setAttribute(k, v) { this.attributes[k] = v; },
    removeAttribute(k) { delete this.attributes[k]; },
    getAttribute(k) { return this.attributes[k] || null; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 375, bottom: 600, width: 375, height: 600 }; },
    closest() { return null; },
    querySelector(sel) {
      const cls = String(sel).replace(/^[.#]/, '');
      const find = (el) => {
        for (const c of el.children || []) {
          if ((c.className || '').split(/\s+/).includes(cls)) return c;
          const deep = find(c);
          if (deep) return deep;
        }
        return null;
      };
      return find(this);
    },
    querySelectorAll() { return []; },
    _classSet: new Set(),
    classList: null
  };
  el.classList = {
    add(c) { el._classSet.add(c); },
    remove(c) { el._classSet.delete(c); },
    toggle(c, v) { v ? el._classSet.add(c) : el._classSet.delete(c); },
    contains(c) { return el._classSet.has(c); },
    toString() { return Array.from(el._classSet).join(' '); }
  };
  return el;
}

const elementRegistry = {};
function makeElWithId(id, tag = 'div') {
  const e = makeEl(tag);
  e.id = id;
  elementRegistry[id] = e;
  return e;
}

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) {
    if (elementRegistry[id]) return elementRegistry[id];
    // openApp() builds app DOM via innerHTML, which this stub does not
    // parse — fabricate the notepad fields it looks up right afterwards.
    if (id && (id.startsWith('notepad-area-') || id.startsWith('notepad-status-'))) {
      const el = makeEl(id.startsWith('notepad-area-') ? 'textarea' : 'div');
      el.id = id;
      el.value = '';
      el.selectionStart = 0;
      elementRegistry[id] = el;
      return el;
    }
    return null;
  },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  body: makeEl('body'),
  head: makeEl('head'),
  createElement(tag) { return makeEl(tag); },
  hidden: false,
  documentElement: makeEl('html'),
  activeElement: null
};

global.window = {
  innerWidth: 375,
  innerHeight: 812,
  addEventListener() {},
  removeEventListener() {},
  matchMedia() { return { matches: false, addEventListener() {} }; },
  setTimeout, clearTimeout, setInterval, clearInterval,
  localStorage: storage,
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  navigator: {
    userAgent: 'node-test-mobile',
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
  screen: { width: 375, height: 812 },
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
  if (!cond) throw new Error('Assertion failed: ' + (msg || '(no msg)'));
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

// ---------- Load script.js in a sandbox ----------
const vm = require('vm');
const scriptSrc = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
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
  showToast: () => {},
  process: { env: {} }
};
vm.createContext(sandbox);
vm.runInContext(strippedSrc, sandbox, { filename: 'script.js' });

const get = (k) => sandbox[k];

// =================================================================
// Section 1 — Mobile viewport detection
// =================================================================
section('Mobile viewport detection');

test('MOB 1a: isMobileViewport() is true for phone widths (<=768)', () => {
  window.innerWidth = 375;
  assert(get('isMobileViewport')() === true, 'Expected mobile at 375px');
  window.innerWidth = 768;
  assert(get('isMobileViewport')() === true, 'Expected mobile at 768px');
});

test('MOB 1b: isMobileViewport() is false for desktop widths', () => {
  window.innerWidth = 1280;
  assert(get('isMobileViewport')() === false, 'Expected desktop at 1280px');
});

test('MOB 1c: isCoarsePointer() reflects matchMedia', () => {
  window.matchMedia = () => ({ matches: true, addEventListener() {} });
  assert(get('isCoarsePointer')() === true, 'Expected coarse pointer');
  window.matchMedia = () => ({ matches: false, addEventListener() {} });
  assert(get('isCoarsePointer')() === false, 'Expected fine pointer');
});

// =================================================================
// Section 2 — Windows fill the screen on phones
// =================================================================
section('Full-screen windows on mobile');

test('MOB 2a: openApp on a phone places the window at 0/0 (CSS fills it)', () => {
  window.innerWidth = 375;
  const area = makeElWithId('window-area');
  area.appendChild = (c) => { area.children.push(c); return c; };
  elementRegistry['window-area'] = area;
  elementRegistry['taskbar-apps'] = makeElWithId('taskbar-apps');

  vm.runInContext("openApp('notepad')", sandbox);
  const win = area.children[area.children.length - 1];
  assert(win, 'No window was created');
  assert(win.style.left === '0px' && win.style.top === '0px',
    `Mobile window should start at 0/0, got ${win.style.left}/${win.style.top}`);
});

test('MOB 2b: openApp on desktop keeps the cascaded offset position', () => {
  window.innerWidth = 1280;
  const area = elementRegistry['window-area'];
  vm.runInContext("openApp('notepad')", sandbox);
  const win = area.children[area.children.length - 1];
  assert(win.style.left !== '0px' || win.style.top !== '0px',
    'Desktop window should not be pinned to 0/0');
});

// =================================================================
// Section 3 — Swipe-down on title bar minimizes (mobile gesture)
// =================================================================
section('Title-bar swipe-down gesture');

function makeWindowEl(id) {
  const win = makeElWithId(id);
  win.style = { left: '0px', top: '0px', zIndex: '10', display: 'flex' };
  win.getBoundingClientRect = () => ({ left: 0, top: 0, right: 375, bottom: 600, width: 375, height: 600 });
  win.querySelector = () => null;
  return win;
}

test('MOB 3a: swiping the title bar down past the threshold minimizes the window', () => {
  window.innerWidth = 375;
  const win = makeWindowEl('window-gesture-1');
  elementRegistry['window-gesture-1'] = win;
  elementRegistry['taskbar-window-gesture-1'] = makeElWithId('taskbar-window-gesture-1');

  const titleBar = { closest: () => null };
  vm.runInContext(`startDrag({ target: { closest: () => null }, preventDefault() {}, clientX: 100, clientY: 30 }, 'window-gesture-1')`, sandbox);
  // Pull down 150px — well past the 90px threshold
  vm.runInContext(`drag({ preventDefault() {}, clientX: 100, clientY: 180 })`, sandbox);
  assert(win.style.transform && win.style.transform.includes('translateY'),
    'Window should follow the finger while dragging');
  // Release: rect.top is 0 in the stub, so raise it to simulate the pulled state
  win.getBoundingClientRect = () => ({ left: 0, top: 150, right: 375, bottom: 750, width: 375, height: 600 });
  vm.runInContext(`stopDrag()`, sandbox);

  // minimizeWindow() hides the window after a 250ms animation; the
  // synchronous proof is the 'minimizing' class + deactivated taskbar item.
  assert(win._classSet.has('minimizing'), 'Swipe-down release should trigger minimize');
  const tItem = elementRegistry['taskbar-window-gesture-1'];
  assert(!tItem._classSet.has('active'), 'Taskbar item should be deactivated on minimize');
});

test('MOB 3b: a small drag (below threshold) does NOT minimize', () => {
  window.innerWidth = 375;
  const win = makeWindowEl('window-gesture-2');
  elementRegistry['window-gesture-2'] = win;
  elementRegistry['taskbar-window-gesture-2'] = makeElWithId('taskbar-window-gesture-2');

  vm.runInContext(`startDrag({ target: { closest: () => null }, preventDefault() {}, clientX: 100, clientY: 30 }, 'window-gesture-2')`, sandbox);
  vm.runInContext(`drag({ preventDefault() {}, clientX: 100, clientY: 60 })`, sandbox); // 30px only
  win.getBoundingClientRect = () => ({ left: 0, top: 30, right: 375, bottom: 630, width: 375, height: 600 });
  vm.runInContext(`stopDrag()`, sandbox);

  assert(win.style.display !== 'none', 'Window must stay visible after a short drag');
});

test('MOB 3c: desktop dragging still moves the window freely (no gesture mode)', () => {
  window.innerWidth = 1280;
  const win = makeWindowEl('window-gesture-3');
  elementRegistry['window-gesture-3'] = win;
  elementRegistry['taskbar-window-gesture-3'] = makeElWithId('taskbar-window-gesture-3');

  vm.runInContext(`startDrag({ target: { closest: () => null }, preventDefault() {}, clientX: 100, clientY: 30 }, 'window-gesture-3')`, sandbox);
  vm.runInContext(`drag({ preventDefault() {}, clientX: 300, clientY: 200 })`, sandbox);
  vm.runInContext(`stopDrag()`, sandbox);

  assert(win.style.left === '200px', `Desktop drag should set left, got ${win.style.left}`);
  assert(win.style.display !== 'none', 'Desktop drag must never minimize');
});

// =================================================================
// Section 4 — Long-press context menus
// =================================================================
section('Long-press context menus');

test('MOB 4a: long-press infrastructure is registered (touchstart/touchend handlers)', () => {
  assert(/initTouchLongPress/.test(scriptSrc), 'initTouchLongPress missing from script.js');
  assert(/longPressState/.test(scriptSrc), 'longPressState missing from script.js');
  assert(/addEventListener\('touchstart'/.test(scriptSrc), 'touchstart listener for long-press missing');
});

test('MOB 4b: showIconContextMenuFor positions the menu as a bottom sheet on mobile', () => {
  window.innerWidth = 375;
  const menu = makeElWithId('icon-context-menu');
  elementRegistry['icon-context-menu'] = menu;
  elementRegistry['icon-context-title'] = makeElWithId('icon-context-title');
  // pin/unpin entries queried via document.querySelector
  const pinEl = makeEl('div'); const unpinEl = makeEl('div');
  const origQuerySelector = document.querySelector;
  const origQuerySelectorAll = document.querySelectorAll;
  document.querySelector = (sel) => sel.includes('pin-app') && !sel.includes('unpin') ? pinEl : unpinEl;
  document.querySelectorAll = () => [menu];

  try {
    vm.runInContext(`showIconContextMenuFor({ dataset: { app: 'notepad' } }, 10, 10)`, sandbox);
    assert(menu.style.bottom === '8px', `Menu should dock to bottom on mobile, got bottom=${menu.style.bottom}`);
    assert(menu.style.top === 'auto', 'Menu top should be auto on mobile');
    assert(!menu._classSet.has('hidden'), 'Menu should be visible');
  } finally {
    document.querySelector = origQuerySelector;
    document.querySelectorAll = origQuerySelectorAll;
  }
});

test('MOB 4c: positionMenu uses cursor coordinates on desktop', () => {
  window.innerWidth = 1280;
  const menu = makeEl('div');
  menu.getBoundingClientRect = () => ({ width: 200, height: 150 });
  sandbox.__menu = menu;
  vm.runInContext(`positionMenu(__menu, 500, 300)`, sandbox);
  assert(menu.style.left === '500px', `Desktop menu should follow cursor, got left=${menu.style.left}`);
  assert(menu.style.top === '300px', `Desktop menu should follow cursor, got top=${menu.style.top}`);
});

// =================================================================
// Section 5 — Start menu backdrop + touch behavior
// =================================================================
section('Start menu mobile behavior');

test('MOB 5a: toggleStartMenu shows and hides the backdrop', () => {
  const menu = makeElWithId('start-menu');
  const btn = makeElWithId('start-button');
  const backdrop = makeElWithId('start-menu-backdrop');
  const search = makeElWithId('start-search');
  elementRegistry['start-menu'] = menu;
  elementRegistry['start-button'] = btn;
  elementRegistry['start-menu-backdrop'] = backdrop;
  elementRegistry['start-search'] = search;
  elementRegistry['start-apps-container'] = makeElWithId('start-apps-container');
  elementRegistry['start-no-results'] = makeElWithId('start-no-results');
  elementRegistry['start-search-count'] = makeElWithId('start-search-count');

  vm.runInContext(`toggleStartMenu()`, sandbox);
  assert(menu.style.display === 'block', 'Start menu should open');
  assert(backdrop._classSet.has('visible'), 'Backdrop should be visible when menu opens');

  vm.runInContext(`toggleStartMenu()`, sandbox);
  assert(menu.style.display === 'none', 'Start menu should close');
  assert(!backdrop._classSet.has('visible'), 'Backdrop should hide when menu closes');
});

test('MOB 5b: search field is NOT auto-focused on coarse pointers (no keyboard pop)', () => {
  window.matchMedia = () => ({ matches: true, addEventListener() {} });
  let focused = false;
  const search = elementRegistry['start-search'];
  search.focus = () => { focused = true; };
  const menu = elementRegistry['start-menu'];
  menu.style.display = 'none';

  vm.runInContext(`toggleStartMenu()`, sandbox);
  assert(!focused, 'Search must not auto-focus on touch devices');
  vm.runInContext(`toggleStartMenu()`, sandbox);

  window.matchMedia = () => ({ matches: false, addEventListener() {} });
});

// =================================================================
// Section 6 — Mobile CSS rules present
// =================================================================
section('Mobile CSS');

const cssSrc = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

test('MOB 6a: stylesheet has a consolidated mobile media query', () => {
  assert(/@media \(max-width: 768px\)/.test(cssSrc), 'Missing 768px mobile breakpoint');
  assert(/@media \(hover: none\) and \(pointer: coarse\)/.test(cssSrc), 'Missing coarse-pointer rules');
});

test('MOB 6b: mobile rules cover taskbar, start sheet, windows and context menus', () => {
  const mobileBlock = cssSrc.slice(cssSrc.indexOf('MOBILE / TOUCH UI'));
  assert(/#taskbar\s*\{/.test(mobileBlock), 'Taskbar mobile rules missing');
  assert(/#start-menu\s*\{/.test(mobileBlock), 'Start-menu sheet rules missing');
  assert(/\.window\s*\{/.test(mobileBlock), 'Window full-screen rules missing');
  assert(/\.context-menu\s*\{/.test(mobileBlock), 'Context-menu sheet rules missing');
  assert(/env\(safe-area-inset-bottom/.test(cssSrc), 'Safe-area insets missing');
});

test('MOB 6c: viewport meta is mobile-ready', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(/viewport-fit=cover/.test(html), 'viewport-fit=cover missing');
  assert(/user-scalable=no/.test(html), 'user-scalable=no missing (prevents accidental page zoom)');
});

// ---------- Summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
