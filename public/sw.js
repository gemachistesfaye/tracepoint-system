/* TracePoint Service Worker v3 - Professional PWA */
const CACHE_VERSION = "3.0.0";
const CACHE_NAME = `tracepoint-v${CACHE_VERSION}`;
const STATIC_CACHE = `tracepoint-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `tracepoint-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `tracepoint-images-v${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

const CACHE_MAX_AGE = {
  static: 30 * 24 * 60 * 60 * 1000,
  dynamic: 7 * 24 * 60 * 60 * 1000,
  images: 30 * 24 * 60 * 60 * 1000,
};

const EXTERNAL_URLS_TO_CACHE = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

// Install - precache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old versioned caches
self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Helper: determine cache strategy based on request
function getStrategy(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/static/") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css")) {
    return "cache-first";
  }
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    return "cache-first";
  }
  if (url.pathname.startsWith("/api/") || url.pathname.includes("firestore")) {
    return "network-only";
  }
  if (request.mode === "navigate") {
    return "network-first";
  }
  return "network-first";
}

function isOpenExternalResource(request) {
  const url = new URL(request.url);
  return EXTERNAL_URLS_TO_CACHE.some((ext) => url.origin === new URL(ext).origin);
}

// Fetch handler with smart strategies
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.startsWith("chrome-extension://")) return;
  if (event.request.url.includes("firestore.googleapis.com")) return;
  if (event.request.url.includes("identitytoolkit")) return;
  if (event.request.url.includes("securetoken.googleapis.com")) return;
  if (event.request.url.includes("fcmregistrations.googleapis.com")) return;

  const strategy = getStrategy(event.request);
  const url = new URL(event.request.url);

  if (strategy === "network-only") return;

  if (strategy === "cache-first") {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});

// Cache First: serve from cache, fallback to network (for static assets)
async function cacheFirst(request) {
  const cacheName = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(new URL(request.url).pathname)
    ? IMAGE_CACHE
    : STATIC_CACHE;
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// Network First: try network, fallback to cache (for HTML/API calls)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      const fallback = await caches.match("/index.html");
      if (fallback) return fallback;
    }

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
