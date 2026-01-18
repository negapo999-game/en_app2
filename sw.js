const CACHE_NAME = "word-app-v1";

const ASSETS = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./title-screen.html",
  "./title-screen.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./words_001_300.json",
  "./words_301_600.json",
  "./words_601_900.json",
  "./words_901_1200.json",
  "./words_1201_1500.json",
  "./words_1501_1800.json",
  "./words_1801_2027.json"
];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((res) => {
//       return res || fetch(event.request);
//     })
//   );
// });

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});