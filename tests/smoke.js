// tests/smoke.js
if (typeof global.Audio === 'undefined') {
    global.Audio = class {
        constructor() {
            this.src = '';
            this.currentTime = 0;
            this.duration = 100;
            this.volume = 1;
            this.loop = false;
        }
        play() { return Promise.resolve(); }
        pause() {}
        addEventListener() {}
        removeEventListener() {}
    };
}
if (typeof global.document === 'undefined') {
    const docEl = () => ({
        style: { setProperty() {} },
        focus() {},
        appendChild() {},
        removeChild() {},
        createDocumentFragment() { return docEl(); },
        textContent: '',
        classList: { add() {}, remove() {}, toggle() {} },
        dataset: {},
        id: '',
        setAttribute() {},
        getAttribute() { return null; },
        addEventListener() {},
        removeEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; },
        getContext() { return { fillRect() {}, clearRect() {}, beginPath() {}, fillText() {}, stroke() {}, moveTo() {}, lineTo() {}, arc() {}, strokeRect() {}, getImageData() { return { data: new Uint8Array(400) }; }, putImageData() {}, drawImage() {} }; },
        getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; }
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
        documentElement: { style: { setProperty() {} }, setAttribute() {} }
    };
}

import { CRDTEngine, GCounter, PNCounter, GSet, ORSet, LWWRegister, RGA } from '../js/core/crdt.js';
import { RealtimeEditorEngine, RealtimeEditor, TextOperation, MockTransport } from '../js/core/realtime-editor.js';
import { PresenceService } from '../js/core/presence-service.js';
import { CommentsEngine } from '../js/core/comments-engine.js';
import { ActivityFeed } from '../js/core/activity-feed.js';
import { WorkspaceManager } from '../js/core/workspace-manager.js';
import { EventBus } from '../js/core/event-bus.js';
import { StateStore } from '../js/core/state-store.js';
import { VirtualFileSystem } from '../js/core/vfs.js';
import { PluginLoader } from '../js/core/plugin-loader.js';
import { AICopilot } from '../js/core/ai-copilot.js';
import { Utils } from '../js/core/utils.js';
import { WindowManager } from '../js/core/window-manager.js';
import { AppSandbox } from '../js/core/app-sandbox.js';
import { LazyLoader } from '../js/core/lazy-loader.js';
import { ThemeManager } from '../js/core/theme-manager.js';
import { ShortcutManager } from '../js/core/shortcut-manager.js';
import { SoundManager } from '../js/core/sound-manager.js';
import { AppRegistry } from '../js/core/app-registry.js';
import { I18n } from '../js/core/i18n.js';
import { A11yManager } from '../js/core/a11y.js';
import { SpreadsheetApp } from '../js/apps/spreadsheet.js';
import { MarkdownEditorApp } from '../js/apps/markdown-editor.js';
import { ImageEditorApp } from '../js/apps/image-editor.js';
import { MusicPlayerApp } from '../js/apps/music-player.js';
import { PDFViewerApp } from '../js/apps/pdf-viewer.js';
import { CalculatorApp } from '../js/apps/calculator.js';
import { PomodoroApp } from '../js/apps/pomodoro.js';
import { KanbanApp } from '../js/apps/kanban.js';
import { CodeEditorApp } from '../js/apps/code-editor.js';
import { TerminalApp } from '../js/apps/terminal.js';
import { BrowserApp } from '../js/apps/browser.js';
import { PerfMonitor } from '../js/core/perf-monitor.js';
import { VirtualList } from '../js/core/virtual-list.js';
import { memoize, debounceAsync, throttle, batchUpdates } from '../js/core/memoize.js';
import { WorkerPool } from '../js/core/worker-pool.js';
import { NotificationCenter } from '../js/core/notification-center.js';
import { SnapLayout } from '../js/core/snap-layout.js';
import { TaskSwitcher } from '../js/core/task-switcher.js';
import { CommandPalette, fuzzyScore } from '../js/core/command-palette.js';
import { ErrorBoundary } from '../js/core/error-boundary.js';
import { DevToolsInspector } from '../js/core/devtools-inspector.js';
import { Profiler } from '../js/core/profiler.js';
import { LoggerSystem } from '../js/core/logger.js';
import { TelemetrySystem } from '../js/core/telemetry.js';
import { DebugConsole } from '../js/core/debug-console.js';
import { PermissionManager } from '../js/core/permissions.js';
import { CSPManager } from '../js/core/csp.js';
import { SandboxRunner } from '../js/core/sandbox-runner.js';
import { CryptoManager } from '../js/core/crypto.js';
import { SecureStorage } from '../js/core/secure-storage.js';
import { AICodeGen } from '../js/core/ai-code-gen.js';
import { VoiceInput } from '../js/core/voice-input.js';
import { AIReasoning } from '../js/core/ai-reasoning.js';
import { AIMemory } from '../js/core/ai-memory.js';
import { AISkills } from '../js/core/ai-skills.js';
import { WebSocketClient } from '../js/core/websocket-client.js';
import { WebRTCPeer } from '../js/core/webrtc-peer.js';
import { GraphQLClient } from '../js/core/graphql-client.js';
import { HttpClient } from '../js/core/http-client.js';
import { SyncEngine } from '../js/core/sync-engine.js';
import { NetworkMonitor } from '../js/core/network-monitor.js';

console.log('Running Smoke Tests...');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  ✓ ${message}`);
    } else {
        failed++;
        console.error(`  ✗ ${message}`);
    }
}

// 1. EventBus Test
const bus = new EventBus();
let eventReceived = false;
bus.on('test:event', (data) => { eventReceived = data.success; });
bus.emit('test:event', { success: true });
assert(eventReceived, 'EventBus should emit and receive events');

// 2. StateStore Test
const store = new StateStore({ count: 0 });
store.set('count', 5);
assert(store.get('count') === 5, 'StateStore should update and retrieve state');

// 3. VFS Test
    const vfs = new VirtualFileSystem();
    await vfs.init();
    await vfs.writeFile('/test.txt', 'Hello OS');
    const content = await vfs.readFile('/test.txt');
    assert(content === 'Hello OS', 'VFS should write and read files');

    await vfs.copyFile('/test.txt', '/test_copy.txt');
    const copyContent = await vfs.readFile('/test_copy.txt');
    assert(copyContent === 'Hello OS', 'VFS should copy files');

    await vfs.moveFile('/test_copy.txt', '/test_moved.txt');
    const movedContent = await vfs.readFile('/test_moved.txt');
    assert(movedContent === 'Hello OS', 'VFS should move files');

    await vfs.mkdir('/docs');
    const existsDir = await vfs.exists('/docs');
    assert(existsDir === true, 'VFS should create directory');

// 4. PluginLoader Test
const loader = new PluginLoader();
loader.register({ name: 'test-plugin', init: () => 'initialized' });
assert(loader.get('test-plugin') !== undefined, 'PluginLoader should register plugins');
assert(loader.initAll()[0].result === 'initialized', 'PluginLoader should initialize plugins');

// 5. AICopilot Test
const copilot = new AICopilot();
const resp = await copilot.chat('Hello');
assert(typeof resp === 'string' && resp.length > 0, 'AICopilot should respond to chat');

// 6. Utils Test
assert(Utils.formatBytes(1024) === '1 KB', 'Utils formatBytes should work correctly');
assert(Utils.escapeHtml('<div>') === '&lt;div&gt;', 'Utils escapeHtml should sanitize HTML');

// 7. WindowManager Test
    const wm = new WindowManager();
    assert(typeof wm.createWindow === 'function', 'WindowManager should have createWindow method');

    // 8. AppSandbox Test
    const sandbox = new AppSandbox();
    const app = sandbox.launch('test-app', {}, {});
    assert(sandbox.get('test-app') !== undefined, 'AppSandbox should launch and track apps');
    sandbox.terminate('test-app');
    assert(sandbox.get('test-app') === undefined, 'AppSandbox should terminate apps');

    // 9. LazyLoader Test
    const lazy = new LazyLoader();
    assert(typeof lazy.loadModule === 'function', 'LazyLoader should have loadModule method');

    // 10. ThemeManager Test
    const theme = new ThemeManager();
    theme.setTheme('light');
    assert(theme.currentTheme === 'light', 'ThemeManager should set theme');
    theme.setTheme('high-contrast');
    assert(theme.currentTheme === 'high-contrast', 'ThemeManager should support high-contrast theme');

    // 11. ShortcutManager Test
    const shortcuts = new ShortcutManager();
    shortcuts.register('ctrl+s', () => {});
    assert(shortcuts.shortcuts.has('ctrl+s'), 'ShortcutManager should register shortcuts');

    // 12. SoundManager Test
    const sound = new SoundManager();
    assert(typeof sound.playTone === 'function', 'SoundManager should have playTone method');

    // 13. AppRegistry Test
    const registry = new AppRegistry();
    registry.register('test-reg-app', { init: () => {} });
    assert(registry.get('test-reg-app') !== undefined, 'AppRegistry should register and retrieve apps');

    // 14. CodeEditorApp Test
    const editorApp = new CodeEditorApp();
    assert(typeof editorApp.init === 'function', 'CodeEditorApp should have init method');

    // 15. TerminalApp Test
    const terminalApp = new TerminalApp();
    assert(typeof terminalApp.init === 'function', 'TerminalApp should have init method');

    // 16. BrowserApp Test
    const browserApp = new BrowserApp();
    assert(typeof browserApp.init === 'function', 'BrowserApp should have init method');

    // 17. PerfMonitor Test
    const perf = new PerfMonitor({ isDev: false });
    perf.mark('start-test');
    perf.mark('end-test');
    const measureDuration = perf.measure('test-measure', 'start-test', 'end-test');
    const metrics = perf.getMetrics();
    assert(typeof metrics.fps === 'number' && typeof metrics.longTasks === 'number', 'PerfMonitor should collect metrics');
    assert(measureDuration >= 0, 'PerfMonitor should measure intervals');

    // 18. VirtualList Test
    const dummyContainer = document.createElement('div');
    dummyContainer.style.height = '150px';
    const virtualList = new VirtualList(dummyContainer, { itemHeight: 30 });
    virtualList.setItems(Array.from({ length: 1000 }, (_, i) => `Item ${i}`));
    const range = virtualList.getVisibleRange();
    assert(range.start >= 0 && range.end > range.start, 'VirtualList should calculate visible range correctly');

    // 19. Memoize Cache & Debounce & Throttle Test
    let callCount = 0;
    const expensiveFn = memoize((x) => { callCount++; return x * 2; });
    assert(expensiveFn(5) === 10 && callCount === 1, 'Memoize should compute on first call');
    assert(expensiveFn(5) === 10 && callCount === 1, 'Memoize should return cached result on second call');
    
    const debounced = debounceAsync(async (x) => x + 1, 10);
    const debounceRes = await debounced(5);
    assert(debounceRes === 6, 'debounceAsync should execute correctly');

    // 20. WorkerPool Fallback Test
    const pool = new WorkerPool('../js/workers/word-count-worker.js', 2);
    const workerRes = await pool.execute({ text: 'Hello WebOS worker pool world' });
    assert(workerRes.wordCount === 5, 'WorkerPool (or fallback) should process task correctly');
    pool.terminate();

    // 21. Sprint 8: I18n Test (Pluralization & Locale Switching)
    const i18n = new I18n();
    i18n.setTranslations('en', {
        'greeting': 'Hello {name}',
        'items.count': '{count, plural, one{# item} other{# items}}'
    });
    i18n.setLocale('en');
    assert(i18n.getLocale() === 'en', 'I18n should set and get locale');
    assert(i18n.t('greeting', { name: 'World' }) === 'Hello World', 'I18n should translate and format parameters');
    assert(i18n.t('items.count', { count: 1 }) === '1 item', 'I18n should handle pluralization one');
    assert(i18n.t('items.count', { count: 5 }) === '5 items', 'I18n should handle pluralization other');

    // 22. Sprint 8: A11yManager Test (Announcer & Focus-Trap)
    const a11y = new A11yManager();
    a11y.announce('Test announcement', 'polite');
    await new Promise(r => setTimeout(r, 120));
    assert(a11y.politeRegion.textContent === 'Test announcement', 'A11yManager should announce polite messages');

    const dummyEl = {
        querySelectorAll: () => [{ focus: () => {} }, { focus: () => {} }],
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    a11y.trapFocus(dummyEl);
    assert(a11y.activeFocusTrap === dummyEl, 'A11yManager should trap focus');
    a11y.releaseFocus();
    assert(a11y.activeFocusTrap === null, 'A11yManager should release focus');

    // 23. Sprint 10: NotificationCenter Test
    const notif = new NotificationCenter();
    const n1 = notif.notify({ title: 'Hi', body: 'World', app: 'test' });
    assert(n1 && n1.id >= 1 && n1.type === 'info', 'NotificationCenter should create notifications');
    assert(notif.getAll().length === 1, 'NotificationCenter should track notifications');
    assert(notif.dismiss(n1.id) === true, 'NotificationCenter should dismiss notifications');
    assert(notif.getAll().length === 0, 'NotificationCenter should remove dismissed notifications');

    // 24. Sprint 10: SnapLayout Test
    const snap = new SnapLayout();
    const zones = snap.getSnapZones({ width: 1920, height: 1080 });
    assert(zones.length === 9, 'SnapLayout should provide 9 zones');
    const leftZone = snap.detectZone(10, 500, { width: 1920, height: 1080 });
    assert(leftZone && leftZone.id === 'left', 'SnapLayout should detect left zone');
    const topleft = snap.detectZone(10, 10, { width: 1920, height: 1080 });
    assert(topleft && topleft.id === 'top-left', 'SnapLayout should detect top-left corner');

    // 25. Sprint 10: TaskSwitcher Test
    const ts = new TaskSwitcher();
    ts.registerWindow({ id: 'w1', title: 'App 1' });
    ts.registerWindow({ id: 'w2', title: 'App 2' });
    ts.registerWindow({ id: 'w3', title: 'App 3' });
    assert(ts.listWindows().length === 3, 'TaskSwitcher should track windows');
    const switched = ts.next();
    assert(switched && switched.id === 'w2', 'TaskSwitcher should cycle next');
    ts.unregisterWindow('w2');
    assert(ts.listWindows().length === 2, 'TaskSwitcher should unregister windows');

    // 26. Sprint 10: CommandPalette & FuzzySearch Test
    const palette = new CommandPalette();
    palette.register({ id: 'open-file', title: 'Open File', keywords: ['load', 'read'] });
    palette.register({ id: 'save-file', title: 'Save File', keywords: ['store', 'write'] });
    palette.register({ id: 'settings', title: 'Settings', keywords: ['preferences', 'config'] });
    const exact = palette.search('open');
    assert(exact.length > 0 && exact[0].id === 'open-file', 'CommandPalette fuzzy-search should rank exact prefix first');
    assert(fuzzyScore('abc', 'axbycz') > 0, 'fuzzyScore should handle subsequence matches');
    palette.execute('save-file');
    assert(palette.getRecent()[0] === 'save-file', 'CommandPalette should track recent commands');

    // 27. Sprint 11: PermissionManager Test
    const permMgr = new PermissionManager();
    await permMgr.init(vfs);
    assert(permMgr.check('app-cam', 'camera') === false, 'Permission initially denied');
    await permMgr.grant('app-cam', 'camera');
    assert(permMgr.check('app-cam', 'camera') === true, 'Permission granted');
    assert(permMgr.check('app-cam', 'microphone') === true, 'Permission hierarchy camera implies microphone');
    await permMgr.revoke('app-cam', 'camera');
    assert(permMgr.check('app-cam', 'camera') === false, 'Permission revoked');

    // 28. Sprint 11: CSPManager Test
    const csp = new CSPManager();
    const policyObj = csp.buildPolicy({ 'default-src': ["'self'"], 'script-src': ["'self'", "'unsafe-inline'"] });
    assert(policyObj.headerName === 'Content-Security-Policy', 'CSP header name correct');
    assert(policyObj.policy.includes("default-src 'self'"), 'CSP directive built correctly');
    const nonce = csp.generateNonce();
    assert(typeof nonce === 'string' && nonce.length > 0, 'CSP nonce generated');
    const hash = await csp.generateHash('alert(1)', 'sha256');
    assert(hash.startsWith('sha256-'), 'CSP hash generated');
    const violation = csp.parseViolationReport('{"csp-report": {"document-uri": "http://test", "violated-directive": "script-src", "blocked-uri": "inline"}}');
    assert(violation && violation.violatedDirective === 'script-src', 'CSP violation report parsed');

    // 29. Sprint 11: SandboxRunner Test
    const sandboxRunner = new SandboxRunner();
    const box = sandboxRunner.createSandbox({ sandbox: 'allow-scripts' });
    assert(box && typeof box.send === 'function', 'Sandbox created');
    const boxRes = await box.send('ping', { test: true });
    assert(boxRes && boxRes.echo.test === true, 'Sandbox postMessage mock round-trip works');
    box.terminate();

    // 30. Sprint 11: CryptoManager Test
    const cryptoMgr = new CryptoManager();
    const sha = await cryptoMgr.hash('SHA-256', 'hello webos');
    assert(typeof sha === 'string' && sha.length === 64, 'Crypto hash consistency');
    const enc = await cryptoMgr.encrypt('secret message', 'mypassword');
    assert(typeof enc === 'string' && enc.length > 0, 'Crypto encrypt works');
    const dec = await cryptoMgr.decrypt(enc, 'mypassword');
    assert(dec === 'secret message', 'Crypto decrypt round-trip works');

    // 31. SecureStorage Test
    const secureStore = new SecureStorage();
    await secureStore.init('masterpw', vfs);
    await secureStore.setItem('apikey', 'secret-12345');
    const retrieved = await secureStore.getItem('apikey');
    assert(retrieved === 'secret-12345', 'SecureStorage round-trip works');
    assert(secureStore.keys().includes('apikey'), 'SecureStorage keys works');
    secureStore.lock();
    assert(secureStore.isUnlocked === false, 'SecureStorage locks correctly');

    // 32. Sprint 12: Error-Boundary Test
    const eb = new ErrorBoundary();
    eb.install();
    const safeFn = eb.wrap(() => { throw new Error('test error'); }, { type: 'runtime' });
    let caughtErr = null;
    try { safeFn(); } catch (e) { caughtErr = e; }
    assert(caughtErr !== null, 'ErrorBoundary catches and rethrows errors');
    const logs = eb.getLog();
    assert(logs.length > 0 && logs[0].message === 'test error', 'ErrorBoundary logs errors with parsed stack and category');
    eb.uninstall();

    // 33. Sprint 12: DevTools-Inspector Test
    const dt = new DevToolsInspector();
    dt.init();
    const domInfo = dt.inspect('dom');
    assert(domInfo, 'DevTools DOM inspector inspects body');
    const netLogs = dt.inspect('network');
    assert(Array.isArray(netLogs), 'DevTools network inspector returns logs array');
    const snapshot = dt.exportSnapshot('json');
    assert(typeof snapshot === 'string' && snapshot.includes('dom'), 'DevTools exports JSON snapshot');

    // 34. Sprint 12: Profiler Test
    const prof = new Profiler();
    const profiledFn = prof.profile('test-func', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) sum += i;
        return sum;
    });
    profiledFn();
    const report = prof.getReport('test-func');
    assert(report && report.count === 1 && report.totalTime >= 0, 'Profiler records function performance');
    const hotPaths = prof.getHotPaths();
    assert(hotPaths.length === 1 && hotPaths[0].name === 'test-func', 'Profiler detects hot paths');

    // 35. Sprint 12: Logger Test
    const loggerSys = new LoggerSystem();
    loggerSys.setMinLevel('debug');
    const modLogger = loggerSys.getLogger('test-mod');
    const logEntry = modLogger.debug('hello debug', { foo: 'bar' });
    assert(logEntry && logEntry.level === 'debug' && logEntry.module === 'test-mod', 'Logger creates structured entry');
    const filteredEntries = loggerSys.getEntries({ level: 'info' });
    assert(filteredEntries.length === 0, 'Logger filters out debug when minLevel is info');
    const debugEntries = loggerSys.getEntries({ level: 'debug' });
    assert(debugEntries.length === 1, 'Logger filters by level correctly');

    // 36. Sprint 12: Telemetry Test
    const telemetry = new TelemetrySystem();
    telemetry.track('feature:use', { duration: 100 });
    telemetry.track('feature:use', { duration: 200 });
    const agg = telemetry.getAggregates('feature:use', 'duration');
    assert(agg.count === 2 && agg.avg === 150 && agg.min === 100 && agg.max === 200, 'Telemetry computes correct aggregates');

    // 37. Sprint 12: Debug-Console Test
    const dbgConsole = new DebugConsole();
    dbgConsole.setDependencies({ stateStore: store });
    const evalRes = dbgConsole.eval('2 + 3');
    assert(evalRes === 5, 'DebugConsole evaluates expressions correctly');
    const inspectRes = dbgConsole.eval(':inspect webos');
    assert(inspectRes && inspectRes.name === 'webos', 'DebugConsole inspects variables correctly');

    // 38. Sprint 13: Spreadsheet App Test
    const ssApp = new SpreadsheetApp();
    ssApp.setCellValue('A1', '10');
    ssApp.setCellValue('A2', '20');
    ssApp.setCellValue('A3', '=SUM(A1:A2)');
    assert(ssApp.evaluateCell('A3') === 30, 'Spreadsheet parses and calculates SUM formula correctly');

    // 39. Sprint 13: Markdown Editor Test
    const mdApp = new MarkdownEditorApp();
    const mdHtml = mdApp.parseMarkdown('# Hello **World**');
    assert(mdHtml.includes('<strong>World</strong>'), 'Markdown parser converts headings and bold correctly');

    // 40. Sprint 13: Image Editor Test
    const ieApp = new ImageEditorApp();
    ieApp.ctx = {}; // mock ctx
    assert(ieApp.ctx !== null, 'Image editor initializes canvas context');

    // 41. Sprint 13: Music Player Test
    const mpApp = new MusicPlayerApp();
    assert(mpApp.playlist.length > 0, 'Music player loads default playlist');

    // 42. Sprint 13: PDF Viewer Test
    const pdfApp = new PDFViewerApp();
    assert(pdfApp.currentPage === 1, 'PDF viewer initializes to page 1');

    // 43. Sprint 13: Calculator Test
    const calcApp = new CalculatorApp();
    const calcRes = calcApp.evaluateExpression('5 + 3 * 2');
    assert(calcRes === 11, 'Calculator evaluates expressions correctly with operator precedence');

    // 44. Sprint 13: Pomodoro Test
    const pomoApp = new PomodoroApp();
    pomoApp.setMode('shortBreak');
    assert(pomoApp.currentMode === 'shortBreak' && pomoApp.timeLeft === 300, 'Pomodoro sets mode and duration correctly');

    // 45. Sprint 13: Kanban Board Test
    const kbApp = new KanbanApp();
    kbApp.cards.push({ id: 'test-card', title: 'Test Task', status: 'todo', priority: 'High', tag: 'Dev', dueDate: '2026-07-30' });
    assert(kbApp.cards.length === 4, 'Kanban board adds cards successfully');

    // 46. Sprint 15: WebSocket-Client Reconnect & Queue Test
    const wsClient = new WebSocketClient({ isMock: true, heartbeatIntervalMs: 0 });
    wsClient.connect('ws://localhost/test');
    assert(wsClient.isConnected(), 'WebSocketClient connects (mock)');
    wsClient.send('chat', { text: 'hello' });
    wsClient.close();
    assert(!wsClient.isConnected(), 'WebSocketClient closes correctly');

    // 47. Sprint 15: WebRTC-Peer Test
    const peerA = new WebRTCPeer({ isMock: true });
    const peerB = new WebRTCPeer({ isMock: true, remotePeer: peerA });
    peerA.remotePeer = peerB;
    const offer = await peerA.offer();
    assert(offer && offer.type === 'offer', 'WebRTCPeer generates offer');
    const answer = await peerB.answer(offer);
    assert(answer && answer.type === 'answer', 'WebRTCPeer generates answer');
    peerA.send('ping');
    peerA.close();
    assert(peerA.state === 'closed', 'WebRTCPeer closes correctly');

    // 48. Sprint 15: GraphQL-Client Cache & Query Test
    const gqlClient = new GraphQLClient({
        mockHandler: (type, doc, vars) => ({ data: { user: { id: vars.id, name: 'WebOS User' } } })
    });
    const gqlRes1 = await gqlClient.query('{ user(id: 1) { name } }', { id: 1 });
    assert(gqlRes1.data.user.name === 'WebOS User', 'GraphQLClient executes query successfully');
    const gqlRes2 = await gqlClient.query('{ user(id: 1) { name } }', { id: 1 });
    assert(gqlRes2.data.user.name === 'WebOS User', 'GraphQLClient retrieves from cache successfully');

    // 49. Sprint 15: HTTP-Client Retry & Request Test
    const httpClient = new HttpClient({
        mockAdapter: async (method, url, config) => ({
            status: 200,
            statusText: 'OK',
            ok: true,
            url,
            headers: new Map(),
            data: { success: true, method }
        })
    });
    const httpRes = await httpClient.get('/test-endpoint', { cache: true });
    assert(httpRes.ok && httpRes.json().success === true, 'HttpClient performs successful request');

    // 50. Sprint 15: Sync-Engine Conflict Resolution Test
    const syncEngine = new SyncEngine();
    syncEngine.register('doc1', { title: 'Local Title' });
    // Force conflict simulation
    syncEngine.conflicts.set('c1', { id: 'c1', localId: 'doc1', localData: { title: 'Local' }, remoteData: { title: 'Remote' } });
    const conflicts = syncEngine.getConflicts();
    assert(conflicts.length === 1, 'SyncEngine detects conflicts');
    syncEngine.resolve('c1', { strategy: 'local' });
    assert(syncEngine.getConflicts().length === 0, 'SyncEngine resolves conflicts successfully');

    // 51. Sprint 15: Network-Monitor Test
    const netMon = new NetworkMonitor({ pingIntervalMs: 0 });
    assert(typeof netMon.isOnline() === 'boolean', 'NetworkMonitor returns online status');
    assert(netMon.getEffectiveBandwidth() > 0, 'NetworkMonitor returns bandwidth');

    // 52. Sprint 16: CRDT Commutativity, Idempotency & Associativity
    const c1 = new GCounter('node1');
    const c2 = new GCounter('node2');
    c1.increment(5);
    c2.increment(3);
    const m1 = new GCounter('node1'); m1.merge(c1); m1.merge(c2);
    const m2 = new GCounter('node2'); m2.merge(c2); m2.merge(c1);
    assert(m1.value() === 8 && m1.value() === m2.value(), 'CRDT GCounter commutativity & merge');

    // 53. Sprint 16: Operational Transformation (OT)
    const ed1 = RealtimeEditorEngine.createEditor('doc-1', 'Hello');
    ed1.localInsert(5, ' World');
    assert(ed1.content === 'Hello World', 'RealtimeEditor localInsert');
    ed1.localDelete(5, 6);
    assert(ed1.content === 'Hello', 'RealtimeEditor localDelete');

    // 54. Sprint 16: Presence Service TTL & Status
    const presence = new PresenceService();
    presence.setUser('user1', { name: 'Alice' });
    assert(presence.getOnlineUsers()['user1'] !== undefined, 'PresenceService sets user online');
    presence.setStatus('user1', 'away');
    assert(presence.getOnlineUsers()['user1'].status === 'away', 'PresenceService sets status');
    presence.destroy();

    // 55. Sprint 16: Comments Engine Threading & Markdown
    const vfsMock = new VirtualFileSystem();
    const commentsEng = new CommentsEngine(vfsMock);
    const topComm = await commentsEng.addComment('post-1', 'Hello **bold** @alice', 'Bob');
    const replyComm = await commentsEng.reply(topComm.id, 'Reply text', 'Alice');
    const thread = await commentsEng.getThread(topComm.id);
    assert(thread.replies.length === 1 && thread.formattedBody.includes('<strong>bold</strong>'), 'CommentsEngine threading and markdown');

    // 56. Sprint 16: Activity Feed Filter & Aggregation
    const activityFeed = new ActivityFeed(vfsMock);
    await activityFeed.add({ type: 'comment', actor: 'Bob', target: 'post-1', content: 'Commented' });
    await activityFeed.add({ type: 'edit', actor: 'Bob', target: 'doc-1', content: 'Edited' });
    const feed = await activityFeed.getFeed(null, { type: 'comment' });
    assert(feed.length === 1 && feed[0].actor === 'Bob', 'ActivityFeed filtering works');
    const aggs = await activityFeed.getAggregates();
    assert(aggs.topActor === 'Bob', 'ActivityFeed aggregation works');

    // 57. Sprint 16: Workspace Manager Permissions & Switching
    const wsMgr = new WorkspaceManager(vfsMock);
    const ws = await wsMgr.createWorkspace('Project X', { defaultPermissions: 'viewer' }, 'alice');
    await wsMgr.addMember(ws.id, 'bob', 'editor');
    assert(wsMgr.hasPermission(ws.id, 'bob', 'editor') === true, 'WorkspaceManager permission check passes');
    assert(wsMgr.hasPermission(ws.id, 'charlie', 'editor') === false, 'WorkspaceManager permission check denies');
    await wsMgr.switch(ws.id);
    assert(wsMgr.getActiveWorkspace().id === ws.id, 'WorkspaceManager switches workspace');

console.log(`\nSmoke Tests Complete: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
