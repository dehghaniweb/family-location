// Service worker — پوستهٔ برنامه را برای کار آفلاین نگه می‌دارد، ولی همیشه
// اول از شبکه می‌خواند تا هر به‌روزرسانی فوراً دیده شود؛ کش فقط وقتی استفاده
// می‌شود که اصلاً اینترنت نباشد. (نسخهٔ قبلی برعکس بود: اول کش، که باعث می‌شد
// فایل‌های تازه تا مدت‌ها دیده نشوند.)
const CACHE = 'family-location-shell-v2';
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
  // فقط فایل‌های هم‌مبدأ (پوستهٔ برنامه)؛ هر چیز دیگری
  // (Cloudflare Worker، Apps Script، نقشه، فونت) همیشه مستقیم از شبکه برود
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
  );
});
