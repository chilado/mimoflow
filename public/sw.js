const CACHE_NAME = 'mimoflow-v2.0.0';
const RUNTIME_CACHE = 'mimoflow-runtime-v2.0.0';
const IMAGE_CACHE = 'mimoflow-images-v2.0.0';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/placeholder.svg'
];

// Cache size limits
const MAX_RUNTIME_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;
const CACHE_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => !currentCaches.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Helper: Check if cache is expired
function isCacheExpired(response) {
  if (!response) return true;
  
  const cachedDate = response.headers.get('sw-cached-date');
  if (!cachedDate) return false;
  
  const age = Date.now() - new Date(cachedDate).getTime();
  return age > CACHE_EXPIRATION_TIME;
}

// Helper: Add timestamp to cached response
async function addTimestampToResponse(response) {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.append('sw-cached-date', new Date().toISOString());
  
  const body = await clonedResponse.blob();
  return new Response(body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers
  });
}

// Strategy: Network-first (for API calls)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      const responseWithTimestamp = await addTimestampToResponse(response);
      cache.put(request, responseWithTimestamp.clone());
      await limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
      return response;
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached && !isCacheExpired(cached)) {
      return cached;
    }
    
    // Return offline page or error
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Você está offline' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Strategy: Cache-first (for static assets)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached && !isCacheExpired(cached)) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      const responseWithTimestamp = await addTimestampToResponse(response);
      cache.put(request, responseWithTimestamp.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

// Strategy: Stale-while-revalidate (for images)
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(IMAGE_CACHE);
        const responseWithTimestamp = await addTimestampToResponse(response);
        cache.put(request, responseWithTimestamp.clone());
        await limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

// Fetch event - route to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // Network-first for API calls (Supabase, etc)
  if (
    url.hostname.includes('supabase') ||
    url.pathname.includes('/rest/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/storage/') ||
    url.pathname.includes('/functions/')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Stale-while-revalidate for images
  if (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Cache-first for static assets
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    /\.(css|js|woff|woff2|ttf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Network-first for everything else (HTML, etc)
  event.respondWith(networkFirst(request));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}

// Push notifications support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nova notificação do MimoFlow',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MimoFlow', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
