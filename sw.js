
const CACHE = 'deutsch-zauber-v3';

const FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './words.json',
  './manifest.json'
];

// نصب نسخهٔ جدید
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// پاک‌کردن کش نسخه‌های قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('deutsch-zauber-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// دریافت فایل‌ها و تازه‌سازی فهرست واژه‌ها
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  const isWordsFile =
    url.origin === self.location.origin &&
    url.pathname.endsWith('/words.json');

  if (isWordsFile) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then(cache => {
              cache.put('./words.json', copy);
            });
          }

          return response;
        })
        .catch(() => caches.match('./words.json'))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (response.ok &&
              url.origin === self.location.origin) {
            const copy = response.clone();

            caches.open(CACHE).then(cache => {
              cache.put(event.request, copy);
            });
          }

          return response;
        });
      })
      .catch(() => caches.match('./index.html'))
  );
});
