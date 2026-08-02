const CACHE_NAME = 'webos-cache-v2';
const APP_SHELL = 'index.html';
const ASSETS = [
    './',
    'index.html',
    'style.css',
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    'notifications.js',
    'js/core/event-bus.js',
    'js/core/state-store.js',
    'js/core/vfs.js',
    'js/core/plugin-loader.js',
    'js/core/ai-copilot.js',
    'js/core/ai-code-gen.js',
    'js/core/voice-input.js',
    'js/core/ai-reasoning.js',
    'js/core/ai-memory.js',
    'js/core/ai-skills.js',
    'script.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL, response.clone()));
                    }
                    return response;
                })
                .catch(() => caches.match(APP_SHELL))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const networkResponse = fetch(event.request).then((response) => {
                if (response.ok) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                }
                return response;
            });
            return cachedResponse || networkResponse;
        })
    );
});
