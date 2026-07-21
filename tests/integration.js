// Integration test: load core modules + script.js in simulated browser environment
const fs = require('fs');

// --- Browser global stubs ---
const localStorageStub = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; },
  clear() { this.data = {}; }
};

const docEl = () => ({
  style: {},
  focus() {},
  appendChild() {},
  removeChild() {},
  textContent: '',
  classList: { add() {}, remove() {}, toggle() {} },
  dataset: {},
  id: '',
  onclick: null,
  value: '',
  selectedIndex: -1,
  children: [],
  getContext() { return { fillRect() {}, clearRect() {}, beginPath() {}, fillText() {}, canvas: {} }; },
  setAttribute() {},
  getAttribute() { return null; },
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; }
});

global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById() { return null; },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  body: docEl(),
  head: docEl(),
  createElement(tag) { return docEl(); },
  hidden: false,
  fullScreenElement: null,
  exitFullscreen() {},
  documentElement: { style: {} }
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener() {},
  removeEventListener() {},
  setTimeout(fn, ms) { return setTimeout(fn, ms); },
  clearTimeout(id) { clearTimeout(id); },
  setInterval(fn, ms) { return setInterval(fn, ms); },
  clearInterval(id) { clearInterval(id); },
  localStorage: localStorageStub,
  location: { href: 'http://localhost/', origin: 'http://localhost' },
  navigator: {
    userAgent: 'node-test',
    clipboard: { writeText() { return Promise.resolve(); } },
    mediaDevices: {
      getUserMedia() { return Promise.resolve({ getTracks() { return []; } }); },
      enumerateDevices() { return Promise.resolve([]); }
    }
  },
  WebOSEventBus: null,
  WebOSState: null,
  WebOSVFS: null,
  WebOSPlugins: null,
  WebOSAI: null,
  SpeechSynthesisUtterance: function(text) { this.text = text; },
  speechSynthesis: { speak() {}, cancel() {}, pause() {}, resume() {} },
  AudioContext: function() {
    this.close = () => {};
    this.suspend = () => {};
    this.resume = () => {};
    this.createOscillator = () => ({ start() {}, stop() {}, connect() {}, disconnect() {}, frequency: { value: 0 } });
    this.createGain = () => ({ gain: { value: 1 }, connect() {}, disconnect() {} });
    this.createAnalyser = () => ({ connect() {}, disconnect() {}, frequencyBinCount: 0, getByteFrequencyData() {} });
    this.destination = { connect() {} };
  },
  MediaRecorder: function() {
    this.ondataavailable = null;
    this.onstop = null;
    this.start = () => {};
    this.stop = () => { if (this.onstop) this.onstop(); };
  },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  performance: { now() { return Date.now(); } },
  requestAnimationFrame(cb) { return setTimeout(() => cb(Date.now()), 16); },
  cancelAnimationFrame(id) { clearTimeout(id); },
  screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040 },
  isSecureContext: true,
  DOMMatrix: function() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
};

global.localStorage = localStorageStub;
global.URL = global.window.URL;
global.performance = global.window.performance;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;
global.AudioContext = global.window.AudioContext;
global.MediaRecorder = global.window.MediaRecorder;
global.speechSynthesis = global.window.speechSynthesis;
global.SpeechSynthesisUtterance = global.window.SpeechSynthesisUtterance;
global.navigator = global.window.navigator;
global.FileReader = function() {
  this.onload = null;
  this.onerror = null;
  this.result = '';
  this.readAsText = function() {
    if (this.onload) this.onload({ target: { result: this.result } });
  };
  this.readAsDataURL = function() {
    if (this.onload) this.onload({ target: { result: 'data:,' + this.result } });
  };
  this.readAsArrayBuffer = function() {
    if (this.onload) this.onload({ target: { result: new ArrayBuffer(0) } });
  };
};

// Load core modules
const coreFiles = [
  './js/core/event-bus.js',
  './js/core/state-store.js',
  './js/core/vfs.js',
  './js/core/plugin-loader.js',
  './js/core/ai-copilot.js'
];

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

try {
  coreFiles.forEach(f => {
    const code = fs.readFileSync(f, 'utf8');
    eval(code);
  });
  passed++;
  console.log('[PASS] Core modules loaded');

  // Verify globals
  assert(global.window.WebOSEventBus, 'EventBus should be defined');
  assert(global.window.WebOSState, 'StateStore should be defined');
  assert(global.window.WebOSVFS, 'VFS should be defined');
  assert(global.window.WebOSPlugins, 'PluginLoader should be defined');
  assert(global.window.WebOSAI, 'AICopilot should be defined');
  passed++;
  console.log('[PASS] Core module globals verified');

  // Test EventBus integration
  let ebCalled = false;
  global.window.WebOSEventBus.on('test-event', (d) => { ebCalled = true; });
  global.window.WebOSEventBus.emit('test-event', { ok: true });
  assert(ebCalled, 'EventBus emit should trigger listener');
  passed++;
  console.log('[PASS] EventBus integration works');

  // Test StateStore
  global.window.WebOSState.set('test', { val: 42 });
  assert(global.window.WebOSState.get('test').val === 42, 'StateStore should persist');
  passed++;
  console.log('[PASS] StateStore integration works');

  // Test PluginLoader
  global.window.WebOSPlugins.register({ id: 'test-app', name: 'Test' }, { init() {} });
  assert(global.window.WebOSPlugins.list().some(p => p.id === 'test-app'), 'Plugin should be registered');
  passed++;
  console.log('[PASS] PluginLoader integration works');

  // Test AICopilot
  global.window.WebOSAI.query('hello').then(r => {
    assert(r && r.length > 0, 'AI should respond');
    passed++;
    console.log('[PASS] AICopilot integration works');
    finish();
  });

} catch (e) {
  failed++;
  console.error('[FAIL]', e.message);
  finish();
}

function finish() {
  console.log(`\nIntegration: ${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
}
