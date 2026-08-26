// Kill-switch service worker.
//
// A previous version cached the app shell (index.html) and served it offline-first
// in some cases. After several deploys, that left some devices serving a STALE
// index.html that referenced an asset hash which no longer exists — so the page
// loaded with no CSS (raw, unstyled HTML). This version removes the service worker
// entirely: it deletes the Cache Storage a previous version created, then
// unregisters itself, so every page load goes straight to the network and is always
// current.
//
// IMPORTANT: this ONLY clears the SW Cache Storage. It does NOT touch localStorage,
// so device-local streaks and settings are fully preserved — nobody loses their streak.
//
// (App registration was removed from main.tsx, so fresh loads won't re-install any
// service worker. A correct, versioned SW can be reintroduced later if we want
// offline/PWA support again.)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* ignore */
      }
      try {
        await self.registration.unregister();
      } catch {
        /* ignore */
      }
      await self.clients.claim();
    })(),
  );
});

// No fetch handler on purpose: every request goes to the network, never the cache.
