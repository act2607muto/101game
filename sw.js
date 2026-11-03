// The game needs Firebase to play, so this worker only makes the page open fast and still open offline.
// Own files: network first, so a new deploy shows up on the next launch; the cache is the offline fallback.
// Versioned third-party files (Firebase SDK, Google Fonts): cache first.
const CACHE = '101-v1';
const SHELL = ['/', '/js/dc-runtime.js', '/js/vendor/react.production.min.js', '/js/vendor/react-dom.production.min.js', '/favicon.svg', '/icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const pinned = url => url.origin === 'https://fonts.gstatic.com' || url.origin === 'https://fonts.googleapis.com' || (url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // every page URL (?join=1234 included) is the same app
    const key = req.mode === 'navigate' ? '/' : req;
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key).then(hit => hit || Response.error())));
  } else if (pinned(url)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      // opaque (no-cors) responses are skipped: an error among them could not be told apart and would stick
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
