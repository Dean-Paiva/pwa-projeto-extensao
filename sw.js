const CACHE_NAME = 'extensao-cache-v3';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './main.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/produto-1.svg',
  './img/produto-2.svg',
  './img/produto-3.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (response.ok || response.type === 'opaque') {
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, response.clone()))
            .then(() => response)
            .catch(() => response);
        }
        return response;
      }).catch(() => caches.match(event.request));
    })
  );
});
