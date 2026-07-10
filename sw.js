/* Stillpoint service worker — offline app shell caching */
const CACHE = 'stillpoint-v6';
const ASSETS = [
  'index.html',
  'styles.css',
  'css/learn.css',
  'css/install-prompt.css',
  'js/main.js',
  'js/core/router.js',
  'js/core/store.js',
  'js/core/utils.js',
  'js/core/sw-register.js',
  'js/features/home.js',
  'js/features/top3.js',
  'js/features/breathe.js',
  'js/features/learn.js',
  'js/features/situation.js',
  'js/features/settings.js',
  'js/features/cue.js',
  'js/features/install.js',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-180.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Only handle same-origin requests; let cross-origin media (e.g. sample
  // videos, which rely on range requests) go straight to the network.
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ||
      fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('index.html'))
    )
  );
});
