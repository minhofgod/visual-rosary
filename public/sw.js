// Service worker for Đọc Kinh Mân Côi. Kept deliberately simple and safe:
//  • Page navigations → network-first (users online always get the latest build;
//    never stuck on a stale version), falling back to the cached app shell offline.
//  • Same-origin static assets → cache-first (Vite hashes filenames, so cached
//    entries are immutable), falling back to the network.
//  • Cross-origin requests (Google Fonts, Supabase) are left untouched.
// Bumping CACHE clears older caches on activate.

const CACHE = 'rosary-v1';
const APP_SHELL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([APP_SHELL, '/manifest.webmanifest']))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fonts, Supabase, etc. — pass through

  // Page navigations: network-first with an offline fallback to the app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(APP_SHELL, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(APP_SHELL))),
    );
    return;
  }

  // Static assets: cache-first (immutable, hashed filenames), then network.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            if (res.ok && res.type === 'basic') {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached),
    ),
  );
});
