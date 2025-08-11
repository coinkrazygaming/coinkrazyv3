const CACHE_NAME = 'coinkrazy-casino-v1.0.0';
const urlsToCache = [
  '/',
  '/games',
  '/store',
  '/daily-rewards',
  '/dashboard',
  '/login',
  '/register',
  '/profile',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST requests and other non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            // Open cache and store the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache successful GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      doBackgroundSync()
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have new rewards waiting! Check your daily bonuses.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: '/images/notification-image.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/daily-rewards'
    },
    actions: [
      {
        action: 'claim',
        title: 'Claim Rewards',
        icon: '/icons/claim-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: 'daily-rewards'
  };

  let title = 'CoinKrazy Casino';
  let body = 'You have new notifications!';

  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    body = data.body || body;
    if (data.url) {
      options.data.url = data.url;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      ...options,
      body
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.notification);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
  if (event.action === 'claim') {
    // Handle claim action
    event.waitUntil(
      clients.openWindow('/daily-rewards')
    );
  } else if (event.action === 'dismiss') {
    // Handle dismiss action
    event.notification.close();
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    console.log('Service Worker: Performing background sync');
    
    // Example: Sync user preferences, game progress, etc.
    const pendingData = await getStoredPendingData();
    
    if (pendingData.length > 0) {
      for (const data of pendingData) {
        await syncDataToServer(data);
      }
      await clearPendingData();
    }
    
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// Helper functions for background sync
async function getStoredPendingData() {
  // Get pending data from IndexedDB or localStorage
  return [];
}

async function syncDataToServer(data) {
  // Sync data to server
  return fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

async function clearPendingData() {
  // Clear pending data after successful sync
  return Promise.resolve();
}

// Update notification for when new version is available
function showUpdateAvailableNotification() {
  self.registration.showNotification('CoinKrazy Update Available', {
    body: 'A new version of CoinKrazy is available. Tap to update.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'update-available',
    requireInteraction: true,
    actions: [
      {
        action: 'update',
        title: 'Update Now'
      },
      {
        action: 'later',
        title: 'Later'
      }
    ]
  });
}

// Check for updates periodically
setInterval(() => {
  console.log('Service Worker: Checking for updates...');
  // Implementation for checking updates
}, 30 * 60 * 1000); // Check every 30 minutes
