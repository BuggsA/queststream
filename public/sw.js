// public/sw.js
// QuestStream service worker

const VERSION = '1.0.0';
const CORE_CACHE = `qs-core-${VERSION}`;
const RUNTIME_CACHE = `qs-runtime-${VERSION}`;

// Precache the app shell
const CORE_ASSETS = [
  './',
  './index.html',
  './episode.html',
  './beat.html',
  './inventory.html',
  './profile.html',
  './events.html',
  './manifest.json',
  // styles
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  // scripts
  './js/app.js',
  './js/player.js',
  './js/beats.js',
  './js/artifacts.js',
  './js/storage.js',
  './js/analytics.js'
  // data files & images are cached at runtime
];

// Make relative URLs absolute to this SW scope
const abs = (p) => new URL(p, self.registration.scope).toString();

/* Install: precache core */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS.map(abs)))
  );
  self.skipWaiting();
});

/* Activate: cleanup old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) =>
        ![CORE_CACHE, RUNTIME_CACHE].includes(k)
      ).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch strategies */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // 1) Navigations: network-first, fallback to cache, then to index.html
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Static assets & JSON: cache-first (fast), then network
  const ext = req.url.split('.').pop().toLowerCase();
  const cacheable = ['css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'json'];
  if (cacheable.includes(ext)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(networkFirst(req));
});

/* ---------- strategies ---------- */

async function networkFirst(request) {
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // final fallback to app shell
    return caches.match(abs('./index.html'));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, res.clone());
  return res;
}
