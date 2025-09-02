const CACHE_NAME = 'habit-harbor-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const sameOrigin = (url) => new URL(url, self.location.origin).origin === self.location.origin;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !sameOrigin(req.url)) return;

  // HTML navigations: network first, fallback to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
        return res;
      }).catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache first, then network and cache
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
