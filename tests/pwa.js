const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

console.log('Running PWA Tests...');

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

// 1. Manifest is valid JSON and subpath-safe
const manifestRaw = read('manifest.json');
let manifest = null;
try {
    manifest = JSON.parse(manifestRaw);
    assert(true, 'manifest.json parses as valid JSON');
} catch {
    assert(false, 'manifest.json parses as valid JSON');
}
if (manifest) {
    assert(manifest.start_url === './', 'manifest start_url is relative');
    assert(manifest.scope === './', 'manifest scope is relative');
    assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'manifest declares at least two icons');
    for (const icon of manifest.icons || []) {
        assert(fs.existsSync(path.join(root, icon.src)), `manifest icon exists: ${icon.src}`);
    }
}

// 2. Service worker exists, has no absolute paths, and lists real files
const swRaw = read('sw.js');
assert(swRaw.includes("addEventListener('install'"), 'sw.js installs assets');
const assetsMatch = swRaw.match(/const ASSETS = \[([\s\S]*?)\];/);
assert(Boolean(assetsMatch), 'sw.js declares ASSETS list');
const assets = assetsMatch
    ? [...assetsMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
    : [];
assert(assets.length > 0, 'sw.js ASSETS list is not empty');
assert(!assets.some((a) => a.startsWith('/')), 'sw.js has no absolute asset paths');
for (const asset of assets.filter((a) => a !== './')) {
    assert(fs.existsSync(path.join(root, asset)), `sw.js asset exists: ${asset}`);
}

// 3. index.html registers the worker relatively and loads only cached scripts
const indexRaw = read('index.html');
assert(/register\('sw\.js'\)/.test(indexRaw), 'index.html registers sw.js with a relative path');
const scripts = [...indexRaw.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
assert(scripts.length > 0, 'index.html loads scripts');
for (const script of scripts) {
    assert(assets.includes(script), `script cached by service worker: ${script}`);
}
for (const css of [...indexRaw.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1])) {
    if (!css.startsWith('http')) {
        assert(assets.includes(css), `stylesheet cached by service worker: ${css}`);
    }
}

// 4. sw.js syntax is valid (Node parses it with a service worker global stubbed)
try {
    new Function('self', swRaw);
    assert(true, 'sw.js is syntactically valid');
} catch (err) {
    assert(false, `sw.js is syntactically valid (${err.message})`);
}

console.log(`\nPWA Tests Complete: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
