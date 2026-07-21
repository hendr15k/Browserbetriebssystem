// sw.js
const CACHE_NAME = 'webos-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/js/core/event-bus.js',
    '/js/core/state-store.js',
    '/js/core/vfs.js',
    '/js/core/plugin-loader.js',
    '/js/core/ai-copilot.js',
    '/js/core/utils.js',
    '/js/core/window-manager.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => {
                console.warn('SW: Some assets failed to cache', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            }).catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
