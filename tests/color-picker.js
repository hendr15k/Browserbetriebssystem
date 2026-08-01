// Regression tests for the Color Picker app (Round 7 feature)

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
    getContext() { return { fillRect() {}, clearRect() {}, beginPath() {}, fillText() {}, stroke() {}, moveTo() {}, lineTo() {}, arc() {}, strokeRect() {}, createLinearGradient() { return { addColorStop() {} }; }, fillStyle: '', getImageData() { return { data: new Uint8ClampedArray([255, 0, 0, 255]) }; } }; },
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
  elementRegistry[id] = e;
  return e;
}

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) { return elementRegistry[id] || null; },
  querySelectorAll(sel) { return []; },
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
  navigator: { userAgent: 'node-test', clipboard: { writeText() { return Promise.resolve(); } } },
  WebOSEventBus: null,
  AudioContext: function() { this.close = () => {}; },
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  screen: { width: 1920, height: 1080 },
  isSecureContext: true,
  DOMMatrix: function() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
};

global.localStorage = storage;
global.navigator = global.window.navigator;

// ---------- Test framework ----------
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + (msg || '(no msg)'));
}
function test(name, fn) {
  try { fn(); passed++; console.log(`[PASS] ${name}`); }
  catch (e) { failed++; console.error(`[FAIL] ${name}: ${e.message}`); }
}
function section(s) { console.log(`\n--- ${s} ---`); }

// ---------- Load script.js ----------
const vm = require('vm');
const scriptSrc = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const strippedSrc = scriptSrc.replace(/^(updateClock\(\);?)\s*$/m, '/* stripped for tests */');

const sandbox = {
  ...global, document, window, localStorage: storage, console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  alert: () => {}, showNotification: () => {}, process: { env: {} }
};
vm.createContext(sandbox);
vm.runInContext(strippedSrc, sandbox, { filename: 'script.js' });
const get = (k) => sandbox[k];

section('Color Picker registration');
test('color-picker is registered in appData', () => {
  const appData = vm.runInContext('appData', sandbox);
  assert(appData !== undefined && appData['color-picker'] !== undefined, 'appData entry missing');
  assert(appData['color-picker'].name === 'Color Picker', 'wrong name');
});
test('color-picker is listed in creative category', () => {
  const cats = vm.runInContext('appCategories', sandbox);
  assert(cats.creative.includes('color-picker'), 'not in creative category');
});
test('color-picker icon data defined', () => {
  const appData = vm.runInContext('appData', sandbox);
  assert(appData['color-picker'].icon, 'no icon');
});

section('Color conversion helpers');
test('rgbToHex converts correctly', () => {
  assert(get('rgbToHex')(255, 0, 0) === '#ff0000', 'red');
  assert(get('rgbToHex')(0, 0, 0) === '#000000', 'black');
  assert(get('rgbToHex')(0, 128, 255) === '#0080ff', 'mixed');
  assert(get('rgbToHex')(12, 34, 56) === '#0c2238', 'zero-padding');
});
test('rgbToHsl converts correctly', () => {
  const red = get('rgbToHsl')(255, 0, 0);
  assert(red[0] === 0 && red[1] === 100 && red[2] === 50, 'red HSL');
  const green = get('rgbToHsl')(0, 255, 0);
  assert(green[0] === 120, 'green hue');
  const blue = get('rgbToHsl')(0, 0, 255);
  assert(blue[0] === 240, 'blue hue');
  const white = get('rgbToHsl')(255, 255, 255);
  assert(white[1] === 0 && white[2] === 100, 'white has 0 saturation');
  const gray = get('rgbToHsl')(128, 128, 128);
  assert(gray[1] === 0 && gray[2] === 50, 'gray');
});

section('Color Picker DOM updates');
test('applyColorPickerColor updates hex/rgb/hsl fields', () => {
  const winId = 'window-color-test';
  const hex = makeElWithId(`cp-hex-${winId}`);
  const rgb = makeElWithId(`cp-rgb-${winId}`);
  const hsl = makeElWithId(`cp-hsl-${winId}`);
  const preview = makeElWithId(`cp-preview-${winId}`);
  const colorInput = makeElWithId(`cp-color-input-${winId}`);
  get('applyColorPickerColor')(winId, 255, 0, 0);
  assert(hex.value === '#ff0000', 'hex field: ' + hex.value);
  assert(rgb.value === 'rgb(255, 0, 0)', 'rgb field: ' + rgb.value);
  assert(hsl.value === 'hsl(0, 100%, 50%)', 'hsl field: ' + hsl.value);
  assert(preview.style.background === '#ff0000', 'preview background');
  assert(colorInput.value === '#ff0000', 'color input value');
});
test('setColorPickerFromHex applies a preset color', () => {
  const winId = 'window-color-preset';
  makeElWithId(`cp-hex-${winId}`);
  makeElWithId(`cp-rgb-${winId}`);
  makeElWithId(`cp-hsl-${winId}`);
  makeElWithId(`cp-preview-${winId}`);
  makeElWithId(`cp-color-input-${winId}`);
  get('setColorPickerFromHex')(winId, '#3498DB');
  assert(get('document').getElementById(`cp-hex-${winId}`).value === '#3498db', 'preset hex applied');
});
test('setColorField is idempotent with missing elements (no throw)', () => {
  get('setColorField')('window-missing', 'cp-hex', '#fff');
  get('setColorField')('window-missing', 'cp-hex', '#fff');
});

// ---------- Summary ----------
console.log(`\nColor Picker tests: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
