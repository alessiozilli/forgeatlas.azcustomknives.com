// Forge Atlas — minimal service worker.
// Purpose: make the site installable + give a friendly offline fallback.
// Network-first: the page is always fetched fresh; cached shell serves only offline.
const SHELL = 'forge-atlas-shell-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(['/', '/favicon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(SHELL).then(c => c.put('/', copy));
        return r;
      }).catch(() => caches.match('/'))
    );
  }
});
