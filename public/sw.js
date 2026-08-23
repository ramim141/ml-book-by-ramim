/*
 * Academic Hub — service worker
 *
 * উদ্দেশ্য সীমিত ও ইচ্ছাকৃত: অ্যাপের খোলস (app shell) ক্যাশ করে রাখা, যাতে
 * দুর্বল সংযোগেও পাতা খোলে। Firestore/Auth এর কোনো অনুরোধ এখানে ছোঁয়া হয় না —
 * পরীক্ষার প্রশ্ন বা উত্তর ক্যাশ করলে বাসি ডেটা দেখানোর ঝুঁকি থাকত।
 */

const VERSION = 'v1';
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;

// index.html সবসময় নেটওয়ার্ক থেকে আগে চাই — না হলে নতুন ডিপ্লয় পৌঁছাত না
const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/** এই অনুরোধগুলো কখনো ক্যাশ করা যাবে না */
function isNetworkOnly(url) {
  return (
    url.hostname.includes('firestore.googleapis.com')
    || url.hostname.includes('identitytoolkit.googleapis.com')
    || url.hostname.includes('securetoken.googleapis.com')
    || url.hostname.includes('firebasestorage.googleapis.com')
    || url.hostname.includes('google-analytics.com')
    || url.hostname.includes('googletagmanager.com')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // শুধু GET — POST/PUT ক্যাশ করার কিছু নেই
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isNetworkOnly(url)) return;

  // পাতা চাওয়া হলে: আগে নেটওয়ার্ক, ব্যর্থ হলে ক্যাশ থেকে খোলস
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || Response.error()))
    );
    return;
  }

  // স্ট্যাটিক ফাইল (js/css/ছবি/ফন্ট): আগে ক্যাশ, না থাকলে নেটওয়ার্ক
  if (/\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|webp|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        });
      })
    );
  }
});
