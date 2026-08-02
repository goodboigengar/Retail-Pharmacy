const CACHE_VERSION = "rxconsult-v6";

const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "ui.js",
  "install.js",
  "manifest.json",
  "data/drugs.json",
  "data/interactions.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-180.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        Promise.all(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => console.error("Precache failed for", url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first strategy: once installed, the app should keep working with no
// network at all. New responses are stashed in the cache as a bonus but the
// app never depends on the network being reachable.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
