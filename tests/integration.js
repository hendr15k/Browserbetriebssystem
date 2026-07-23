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
  createDocumentFragment() { return docEl(); },
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
  location: { href: 'http://localhost/', origin: 'http://localhost', search: '' },
  navigator: {
    userAgent: 'node-test',
    hardwareConcurrency: 4,
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

// Load core modules + Sprint 9 + Sprint 10 modules
const coreFiles = [
  './js/core/event-bus.js',
  './js/core/state-store.js',
  './js/core/vfs.js',
  './js/core/plugin-loader.js',
  './js/core/ai-copilot.js',
  './js/core/app-registry.js',
  './js/core/perf-monitor.js',
  './js/core/virtual-list.js',
  './js/core/memoize.js',
  './js/core/worker-pool.js',
  './js/core/notification-center.js',
  './js/core/snap-layout.js',
  './js/core/task-switcher.js',
  './js/core/command-palette.js',
  './js/core/permissions.js',
  './js/core/csp.js',
  './js/core/sandbox-runner.js',
  './js/core/crypto.js',
  './js/core/secure-storage.js',
  './js/core/error-boundary.js',
  './js/core/devtools-inspector.js',
  './js/core/profiler.js',
  './js/core/logger.js',
  './js/core/telemetry.js',
  './js/core/debug-console.js',
  './js/core/ai-code-gen.js',
  './js/core/voice-input.js',
  './js/core/ai-reasoning.js',
  './js/core/ai-memory.js',
  './js/core/ai-skills.js',
  './js/core/websocket-client.js',
  './js/core/webrtc-peer.js',
  './js/core/graphql-client.js',
  './js/core/http-client.js',
  './js/core/sync-engine.js',
  './js/core/network-monitor.js'
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
  console.log('[PASS] Core & Sprint 9 modules loaded');

  // Verify globals
  assert(global.window.WebOSEventBus, 'EventBus should be defined');
  assert(global.window.WebOSState, 'StateStore should be defined');
  assert(global.window.WebOSVFS, 'VFS should be defined');
  assert(global.window.WebOSPlugins, 'PluginLoader should be defined');
  assert(global.window.WebOSAI, 'AICopilot should be defined');
  assert(global.window.WebOSPerfMonitor, 'PerfMonitor should be defined');
  assert(global.window.WebOSVirtualList, 'VirtualList should be defined');
  assert(global.window.WebOSMemoize, 'Memoize should be defined');
  assert(global.window.WebOSWorkerPool, 'WorkerPool should be defined');
  passed++;
  console.log('[PASS] All module globals verified');

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

  // Test Sprint 9: Memoize & VirtualList & PerfMonitor in integration
  const { memoize, throttle, batchUpdates } = global.window.WebOSMemoize;
  let compCount = 0;
  const memoizedFn = memoize(x => { compCount++; return x * 10; });
  assert(memoizedFn(7) === 70 && compCount === 1, 'Memoize calculation 1');
  assert(memoizedFn(7) === 70 && compCount === 1, 'Memoize calculation cached');
  passed++;
  console.log('[PASS] Memoize integration works');

  // Test VirtualList range calculation
  const containerStub = docEl();
  containerStub.clientHeight = 300;
  const vl = new global.window.WebOSVirtualList(containerStub, { itemHeight: 30 });
  vl.setItems(Array.from({ length: 500 }, (_, i) => i));
  const range = vl.getVisibleRange();
  assert(range.start === 0, 'VirtualList range start');
  passed++;
  console.log('[PASS] VirtualList integration works');

  // Test WorkerPool fallback
  const pool = new global.window.WebOSWorkerPool('../js/workers/word-count-worker.js', 2);
  pool.execute({ text: 'Integration test for worker pool' }).then(res => {
    assert(res.wordCount === 5, 'WorkerPool fallback word count');
    pool.terminate();
    passed++;
    console.log('[PASS] WorkerPool integration works');

// Test AICopilot
  global.window.WebOSAI.query('hello').then(r => {
    assert(r && r.length > 0, 'AI should respond');
    passed++;
    console.log('[PASS] AICopilot integration works');

    // Sprint 10: NotificationCenter integration
    const NotifCenter = global.WebOSNotificationCenter && global.WebOSNotificationCenter.NotificationCenter;
    assert(typeof NotifCenter === 'function', 'NotificationCenter should be exported');
    const nc = new NotifCenter();
    const n = nc.notify({ title: 'Hello', body: 'Integration', app: 'integ' });
    assert(n && n.id > 0, 'NotificationCenter should create');
    assert(nc.getByApp('integ').length === 1, 'NotificationCenter should filter by app');
    passed++;
    console.log('[PASS] NotificationCenter integration works');

    // Sprint 10: SnapLayout integration
    const snap = new global.window.WebOSSnapLayout.SnapLayout();
    const screen = { width: 1920, height: 1080 };
    const left = snap.detectZone(50, 500, screen);
    assert(left && left.id === 'left', 'SnapLayout detect left');
    passed++;
    console.log('[PASS] SnapLayout integration works');

    // Sprint 10: TaskSwitcher integration
    const ts = new global.window.WebOSTaskSwitcher.TaskSwitcher();
    ts.registerWindow({ id: 'win-a', title: 'A' });
    ts.registerWindow({ id: 'win-b', title: 'B' });
    const nxt = ts.next();
    assert(nxt.id === 'win-b', 'TaskSwitcher should rotate');
    passed++;
    console.log('[PASS] TaskSwitcher integration works');

    // Sprint 10: CommandPalette integration
    const cp = new global.window.WebOSCommandPalette.CommandPalette();
    cp.register({ id: 'cmd-x', title: 'Run X', keywords: ['exec'] });
    const matches = cp.search('run');
    assert(matches.length > 0 && matches[0].id === 'cmd-x', 'CommandPalette fuzzy search');
    passed++;
    console.log('[PASS] CommandPalette integration works');

    // Sprint 11: Security & Permissions integration
    const perm = new global.window.WebOSPermissions.PermissionManager();
    perm.grant('app-test', 'geolocation').then(() => {
        assert(perm.check('app-test', 'geolocation') === true, 'PermissionManager integration grant/check');
        passed++;
        console.log('[PASS] PermissionManager integration works');

        const csp = new global.window.WebOSCSP.CSPManager();
        const p = csp.buildPolicy({ 'default-src': ["'self'"] });
        assert(p.policy.includes('default-src'), 'CSPManager integration buildPolicy');
        passed++;
        console.log('[PASS] CSPManager integration works');

        const cryptoMgr = new global.window.WebOSCrypto.CryptoManager();
        cryptoMgr.hash('SHA-256', 'integration').then(h => {
            assert(typeof h === 'string' && h.length === 64, 'CryptoManager integration hash');
            passed++;
            console.log('[PASS] CryptoManager integration works');

            const secureStore = new global.window.WebOSSecureStorage.SecureStorage();
            secureStore.init('pw').then(() => {
                secureStore.setItem('token', 'abc-123').then(() => {
                    secureStore.getItem('token').then(val => {
                        assert(val === 'abc-123', 'SecureStorage integration roundtrip');
                        passed++;
                        console.log('[PASS] SecureStorage integration works');

                        // Sprint 12: DevTools, Profiler, ErrorBoundary, Logger, Telemetry, DebugConsole integration
                        const eb = new global.window.WebOSErrorBoundary.ErrorBoundary();
                        eb.install();
                        const safe = eb.wrap(() => { throw new Error('integration error'); });
                        let caught = false;
                        try { safe(); } catch(e) { caught = true; }
                        assert(caught, 'ErrorBoundary integration catches');
                        eb.uninstall();
                        passed++;
                        console.log('[PASS] ErrorBoundary integration works');

                        const prof = new global.window.WebOSProfiler.Profiler();
                        const pFn = prof.profile('int-fn', () => 100);
                        assert(pFn() === 100, 'Profiler integration');
                        passed++;
                        console.log('[PASS] Profiler integration works');

                        const logSys = new global.window.WebOSLogger.LoggerSystem();
                        const modLog = logSys.getLogger('int-mod');
                        assert(modLog.info('test info') !== null, 'Logger integration');
                        passed++;
                        console.log('[PASS] Logger integration works');

                        const telemetry = new global.window.WebOSTelemetry.TelemetrySystem();
                        telemetry.track('metric', { val: 50 });
                        assert(telemetry.getAggregates('metric', 'val').count === 1, 'Telemetry integration');
                        passed++;
                        console.log('[PASS] Telemetry integration works');

                        const dbg = new global.window.WebOSDebugConsole.DebugConsole();
                        assert(dbg.eval('10 + 20') === 30, 'DebugConsole integration eval');
                        passed++;
                        console.log('[PASS] DebugConsole integration works');

                        // Sprint 14: AI Advanced modules integration
                        const codeGen = global.window.WebOSAICodeGen;
                        assert(codeGen.generate('python', 'for loop').includes('for'), 'AICodeGen integration');
                        passed++;
                        console.log('[PASS] AICodeGen integration works');

                        const voice = global.window.WebOSVoiceInput;
                        voice.simulateInput('integration test');
                        assert(voice.getTranscript().includes('integration test'), 'VoiceInput integration');
                        passed++;
                        console.log('[PASS] VoiceInput integration works');

                        const reasoning = global.window.WebOSAIReasoning;
                        assert(reasoning.plan('test goal').length > 0, 'AIReasoning integration');
                        passed++;
                        console.log('[PASS] AIReasoning integration works');

                        const memory = global.window.WebOSAIMemory;
                        memory.remember('int-key', 'int-val', 'facts');
                        assert(memory.recall('int-key', 'facts').value === 'int-val', 'AIMemory integration');
                        passed++;
                        console.log('[PASS] AIMemory integration works');

                        const skills = global.window.WebOSAISkills;
                        skills.execute('summarize', 'Hello integration world. Test.').then(res => {
                            assert(res.includes('Hello'), 'AISkills integration');
                            passed++;
                            console.log('[PASS] AISkills integration works');

                            // Sprint 15: Networking Modules Integration
                            const WSClient = global.window.WebOSWebSocketClient;
                            const ws = new WSClient({ isMock: true });
                            ws.connect();
                            assert(ws.isConnected(), 'WebSocketClient integration');
                            passed++;
                            console.log('[PASS] WebSocketClient integration works');

                            const WRP = global.window.WebOSWebRTCPeer;
                            const peer = new WRP({ isMock: true });
                            assert(peer.state === 'new', 'WebRTCPeer integration');
                            passed++;
                            console.log('[PASS] WebRTCPeer integration works');

                            const GQL = global.window.WebOSGraphQLClient;
                            const gql = new GQL({ mockHandler: () => ({ data: { ok: true } }) });
                            gql.query('{ test }').then(gRes => {
                                assert(gRes.data.ok === true, 'GraphQLClient integration');
                                passed++;
                                console.log('[PASS] GraphQLClient integration works');

                                const HTTP = global.window.WebOSHttpClient;
                                const http = new global.window.WebOSHttpClient.HttpClient({ mockAdapter: async () => ({ status: 200, ok: true, data: { status: 'ok' } }) });
                                http.get('/api').then(hRes => {
                                    assert(hRes.ok && hRes.json().status === 'ok', 'HttpClient integration');
                                    passed++;
                                    console.log('[PASS] HttpClient integration works');

                                    const Sync = global.window.WebOSSyncEngine;
                                    const sync = new Sync();
                                    sync.register('item1', { a: 1 });
                                    assert(sync.store.has('item1'), 'SyncEngine integration');
                                    passed++;
                                    console.log('[PASS] SyncEngine integration works');

                                     const netMon = global.window.WebOSNetworkMonitor;
                                     assert(typeof netMon.isOnline() === 'boolean', 'NetworkMonitor integration');
                                     passed++;
                                     console.log('[PASS] NetworkMonitor integration works');

                                     // Sprint 16: CRDT, RealtimeEditor, Presence, Comments, Activity, Workspaces integration
                                     const { CRDTEngine } = require('../js/core/crdt.js');
                                     const crdt = CRDTEngine.create('PNCounter', 'node1');
                                     crdt.increment(10);
                                     crdt.decrement(3);
                                     assert(crdt.value() === 7, 'CRDT integration');
                                     passed++;
                                     console.log('[PASS] CRDT integration works');

                                     const { RealtimeEditorEngine } = require('../js/core/realtime-editor.js');
                                     const ed = RealtimeEditorEngine.createEditor('doc', 'abc');
                                     ed.localInsert(3, 'def');
                                     assert(ed.content === 'abcdef', 'RealtimeEditor integration');
                                     passed++;
                                     console.log('[PASS] RealtimeEditor integration works');

                                     const { PresenceService } = require('../js/core/presence-service.js');
                                     const pres = new PresenceService();
                                     pres.setUser('u1', { name: 'User 1' });
                                     assert(pres.getOnlineUsers()['u1'] !== undefined, 'Presence integration');
                                     pres.destroy();
                                     passed++;
                                     console.log('[PASS] Presence integration works');

                                     const { CommentsEngine } = require('../js/core/comments-engine.js');
                                     const comms = new CommentsEngine();
                                     comms.addComment('target', 'Hello @u1', 'author').then(c => {
                                         assert(c.body.includes('@u1'), 'Comments integration');
                                         passed++;
                                         console.log('[PASS] Comments integration works');

                                         const { ActivityFeed } = require('../js/core/activity-feed.js');
                                         const acts = new ActivityFeed();
                                         acts.add({ type: 'status', actor: 'u1', content: 'active' }).then(a => {
                                             assert(a.type === 'status', 'Activity integration');
                                             passed++;
                                             console.log('[PASS] Activity integration works');

                                             const { WorkspaceManager } = require('../js/core/workspace-manager.js');
                                             const wsm = new WorkspaceManager();
                                             wsm.createWorkspace('WS2', {}, 'u1').then(ws2 => {
                                                 assert(ws2.name === 'WS2', 'Workspace integration');
                                                 passed++;
                                                 console.log('[PASS] Workspace integration works');

                                                 finish();
                                             });
                                         });
                                     });
                                 });
                             });
                         });
                     });
                 });
             });
         });
     });
   });
   });

} catch (e) {
  failed++;
  console.error('[FAIL]', e.message);
  finish();
}

function finish() {
  console.log(`\nIntegration: ${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
  process.exit(process.exitCode);
}
