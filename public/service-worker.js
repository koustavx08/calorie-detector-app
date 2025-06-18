const CACHE_NAME = "calorie-detector-pro-v1.0.0"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

const STATIC_ASSETS = ["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png", "/favicon.ico"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)), caches.open(DYNAMIC_CACHE)]),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.includes("/api/") || url.hostname.includes("api.")) {
    event.respondWith(networkFirst(request))
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.some((asset) => url.pathname === asset)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request))
    return
  }

  // Default strategy
  event.respondWith(staleWhileRevalidate(request))
})

// Caching strategies
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  return cached || fetch(request)
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE)

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/")
    }

    throw error
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || fetchPromise
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle offline meal uploads when connection is restored
  const offlineActions = await getOfflineActions()

  for (const action of offlineActions) {
    try {
      await processOfflineAction(action)
      await removeOfflineAction(action.id)
    } catch (error) {
      console.error("Failed to sync offline action:", error)
    }
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: "view",
        title: "View Details",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"))
  }
})

// Helper functions for offline storage
async function getOfflineActions() {
  // Implementation would depend on your offline storage strategy
  return []
}

async function processOfflineAction(action) {
  // Process queued offline actions
}

async function removeOfflineAction(id) {
  // Remove processed offline action
}
