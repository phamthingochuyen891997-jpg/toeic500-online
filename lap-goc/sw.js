// Lấp Gốc TOEIC – service worker: mở nhanh trang chính, vẫn luôn lấy bản mới khi có mạng
const V = 'lapgoc-v8';
const CORE = ['./', './lg.js', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith('/toeic500-online/lap-goc/')) return;
  if (r.headers.has('range') || u.pathname.endsWith('.mp3')) return; // audio: để trình duyệt tự xử lý
  if (u.pathname.includes('/icons/')) {
    e.respondWith(caches.match(r).then(c => c || fetch(r)));
    return;
  }
  // Trang, lg.js, bài luyện thêm: lấy mạng trước, mất mạng thì dùng bản đã lưu
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch: true}).then(c => c || caches.match('./'))));
});
