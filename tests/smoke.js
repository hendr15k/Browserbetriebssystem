// tests/smoke.js
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

    // 11. ShortcutManager Test
    const shortcuts = new ShortcutManager();
    shortcuts.register('ctrl+s', () => {});
    assert(shortcuts.shortcuts.has('ctrl+s'), 'ShortcutManager should register shortcuts');

    // 12. SoundManager Test
    const sound = new SoundManager();
    assert(typeof sound.playTone === 'function', 'SoundManager should have playTone method');

console.log(`\nSmoke Tests Complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
