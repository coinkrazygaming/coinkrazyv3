// Mobile-optimized Service Worker for CoinKrazy PWA
const CACHE_NAME = "coinkrazy-mobile-v1.0.0";
const STATIC_CACHE_NAME = "coinkrazy-static-v1.0.0";
const DYNAMIC_CACHE_NAME = "coinkrazy-dynamic-v1.0.0";
const API_CACHE_NAME = "coinkrazy-api-v1.0.0";

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Resources to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/packages/,
  /\/api\/user\/profile/,
  /\/api\/analytics/,
  /\/api\/promotions/,
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|svg)$/,
  /\/api\/placeholder/,
  /\/images\//,
];

// Background sync tags
const SYNC_TAGS = {
  PURCHASE: "purchase-sync",
  ANALYTICS: "analytics-sync",
  USER_ACTION: "user-action-sync",
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing mobile service worker...");

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting(),
    ]),
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating mobile service worker...");

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      self.clients.claim(),
    ]),
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Handle different resource types
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  switch (event.tag) {
    case SYNC_TAGS.PURCHASE:
      event.waitUntil(syncPurchases());
      break;
    case SYNC_TAGS.ANALYTICS:
      event.waitUntil(syncAnalytics());
      break;
    case SYNC_TAGS.USER_ACTION:
      event.waitUntil(syncUserActions());
      break;
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: "You have new rewards waiting!",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open App",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/close-icon.png",
      },
    ],
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.error("[SW] Error parsing push data:", error);
    }
  }

  event.waitUntil(self.registration.showNotification("CoinKrazy", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (let client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
    );
  }
});

// Helper functions
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isImageRequest(url) {
  return IMAGE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isStaticAsset(url) {
  return (
    STATIC_ASSETS.some((asset) => url.pathname === asset) ||
    url.pathname.startsWith("/static/")
  );
}

// Cache-first strategy for API requests
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Return cached response and update in background
      updateAPICache(request, cache);
      return cachedResponse;
    }

    // No cache, try network
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[SW] API request failed:", error);

    // Return cached response if available
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({ error: "Network unavailable", offline: true }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Cache-first strategy for images
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[SW] Image request failed:", error);

    // Return placeholder image
    return new Response(
      `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9CA3AF">
          Image Unavailable
        </text>
      </svg>`,
      {
        headers: { "Content-Type": "image/svg+xml" },
      },
    );
  }
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[SW] Static asset request failed:", error);
    return new Response("Asset not available", { status: 404 });
  }
}

// Network-first strategy for navigation requests
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("[SW] Navigation request failed:", error);

    // Try cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlineCache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await offlineCache.match("/offline.html");

    return offlinePage || new Response("Offline", { status: 503 });
  }
}

// Background API cache update
async function updateAPICache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log("[SW] Background cache update failed:", error);
  }
}

// Background sync functions
async function syncPurchases() {
  try {
    const purchases = await getStoredData("pending-purchases");

    for (const purchase of purchases) {
      try {
        const response = await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(purchase),
        });

        if (response.ok) {
          await removeStoredData("pending-purchases", purchase.id);
        }
      } catch (error) {
        console.error("[SW] Failed to sync purchase:", error);
      }
    }
  } catch (error) {
    console.error("[SW] Sync purchases failed:", error);
  }
}

async function syncAnalytics() {
  try {
    const events = await getStoredData("pending-analytics");

    if (events.length > 0) {
      try {
        const response = await fetch("/api/analytics/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events }),
        });

        if (response.ok) {
          await clearStoredData("pending-analytics");
        }
      } catch (error) {
        console.error("[SW] Failed to sync analytics:", error);
      }
    }
  } catch (error) {
    console.error("[SW] Sync analytics failed:", error);
  }
}

async function syncUserActions() {
  try {
    const actions = await getStoredData("pending-user-actions");

    for (const action of actions) {
      try {
        const response = await fetch("/api/user/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });

        if (response.ok) {
          await removeStoredData("pending-user-actions", action.id);
        }
      } catch (error) {
        console.error("[SW] Failed to sync user action:", error);
      }
    }
  } catch (error) {
    console.error("[SW] Sync user actions failed:", error);
  }
}

// IndexedDB helpers for offline storage
async function getStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CoinKrazyOfflineDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

async function removeStoredData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CoinKrazyOfflineDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function clearStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CoinKrazyOfflineDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
    case "CACHE_API_RESPONSE":
      cacheAPIResponse(data.request, data.response);
      break;
    case "CLEAR_CACHE":
      clearCaches();
      break;
    case "GET_CACHE_SIZE":
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ type: "CACHE_SIZE", size });
      });
      break;
  }
});

async function cacheAPIResponse(request, response) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    await cache.put(request, response);
  } catch (error) {
    console.error("[SW] Failed to cache API response:", error);
  }
}

async function clearCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log("[SW] All caches cleared");
  } catch (error) {
    console.error("[SW] Failed to clear caches:", error);
  }
}

async function getCacheSize() {
  try {
    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error("[SW] Failed to calculate cache size:", error);
    return 0;
  }
}

console.log("[SW] Mobile service worker loaded successfully");
