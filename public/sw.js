// GerSaKa Platform Service Worker - Offline Health Vault & Emergency Kit
const CACHE_NAME = "gersaka-offline-vault-v2";

const STATIC_PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install: Precache shell and skip waiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[GerSaKa SW] Precaching app shell and offline emergency vault");
      return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
        console.warn("[GerSaKa SW] Precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[GerSaKa SW] Removing old cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart caching strategy (Stale-While-Revalidate for assets, Network-First for API/Nav)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for standard caching, provide offline json for API POST
  if (request.method !== "GET") {
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({
              offline: true,
              timestamp: new Date().toISOString(),
              message: "Perangkat sedang offline. Menampilkan data tersimpan dari penyimpanan lokal (Offline Vault).",
            }),
            {
              headers: { "Content-Type": "application/json" },
              status: 200,
            }
          );
        })
      );
    }
    return;
  }

  // 1. Navigation requests (HTML documents) -> Network-First with offline fallback to /index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match("/index.html");
          if (fallback) return fallback;
          return caches.match("/");
        })
    );
    return;
  }

  // 2. Static Assets (scripts, styles, images, fonts) -> Cache-First or Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Default fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response("Offline", { status: 503, statusText: "Offline" });
    })
  );
});

// Communication with frontend client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
