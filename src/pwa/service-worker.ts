/// <reference lib="webworker" />

(self as unknown as ServiceWorkerGlobalScope).addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open('habit-harbor-v1')
      .then((cache) => cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx',
        '/src/App.tsx',
      ]))
  );
});

(self as unknown as ServiceWorkerGlobalScope).addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
