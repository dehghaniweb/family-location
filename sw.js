// Service worker حداقلی — فقط برای نصب‌پذیر شدن برنامه (Add to Home Screen)
// و باز شدن سریع‌تر پوسته برنامه. داده‌های موقعیت همیشه زنده (network) خوانده می‌شوند.
const CACHE = 'family-location-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // فقط فایل‌های هم‌مبدأ (پوسته برنامه) را از کش بده؛ هر چیز دیگری
  // (Cloudflare Worker، Apps Script، نقشه، فونت) مستقیم و زنده از شبکه برود
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
