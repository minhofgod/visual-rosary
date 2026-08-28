// Service worker for Đọc Kinh Mân Côi (PWA / Play-Store TWA base).
//
//   • Page navigations → NETWORK-FIRST: online users always get the latest deploy;
//     the cached app shell is only a fallback when the network fails (offline).
//   • Same-origin hashed static assets → CACHE-FIRST (Vite hashes filenames, so
//     entries are immutable); populated lazily as they're requested.
//   • Cross-origin requests (Google Fonts, Supabase) are passed straight through.
//   • CACHE is versioned — bump the version to force a clean slate; activate()
//     deletes every older cache, and skipWaiting()+clients.claim() make a new
//     version take over promptly instead of waiting for every tab to close.
//
//   • ART FILENAMES ARE STABLE, NOT CONTENT-HASHED (/images/, /wallpapers/, /avatars/),
//     so cache-first pins whatever a device fetched first. REPLACEMENT ART MUST GET A
//     NEW FILENAME — never overwrite an existing one, or devices that already cached it
//     keep the old picture. (Stale-while-revalidate was tried and rejected: it re-fetches
//     on every request, ~450 KB per wallpaper and up to 2.8 MB per bead image, which is
//     far too costly for a mobile-first audience. Bump CACHE below if art is ever
//     replaced in place anyway.)
//
// This is a clean worker installed fresh by every client (the worker before v2 was a
// self-unregistering kill-switch), so the old stale-cache issue does not carry over.

const CACHE = 'rosary-v3';
const APP_SHELL = '/';
const PRECACHE = ['/', '/manifest.webmanifest', '/logo/png/icon-192.png', '/logo/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fonts, Supabase, etc. — untouched

  // Page navigations: network-first, with an offline fallback to the app shell.
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

  // Static assets: cache-first (immutable, hashed), falling back to the network.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        }),
    ),
  );
});
