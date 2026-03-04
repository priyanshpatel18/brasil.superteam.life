const STATIC_CACHE = "superteam-static-v1";
const RUNTIME_CACHE = "superteam-runtime-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.webmanifest", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function putInRuntimeCache(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
}

async function cacheRequestedUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return;
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.all(
    urls
      .filter((url) => typeof url === "string" && url.trim().length > 0)
      .map(async (url) => {
        try {
          const req = new Request(url, { method: "GET" });
          const res = await fetch(req);
          if (res.ok) {
            await cache.put(req, res.clone());
          }
        } catch {
          // Ignore offline fetch errors while pre-caching.
        }
      })
  );
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "CACHE_URLS") {
    event.waitUntil(cacheRequestedUrls(data.urls));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          await putInRuntimeCache(request, response);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          await putInRuntimeCache(request, response);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          throw new Error("Network error");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then(async (response) => {
          await putInRuntimeCache(request, response);
          return response;
        })
        .catch(() => cached);
    })
  );
});
