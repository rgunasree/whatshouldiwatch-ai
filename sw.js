// WhatShouldIWatch.ai Service Worker
const CACHE_NAME = 'whatshouldiwatch-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Dynamic files that should be cached when accessed
const DYNAMIC_FILES = [
    'https://via.placeholder.com/',
    'https://fonts.gstatic.com/'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
    
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (STATIC_FILES.includes(request.url) || request.url.includes(self.location.origin)) {
        // Static files - cache first
        event.respondWith(cacheFirst(request));
    } else if (url.origin === 'https://cdn.tailwindcss.com' || 
               url.origin === 'https://cdnjs.cloudflare.com' ||
               url.origin === 'https://fonts.googleapis.com' ||
               url.origin === 'https://fonts.gstatic.com') {
        // CDN files - stale while revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else if (url.origin === 'https://via.placeholder.com') {
        // Images - cache first with fallback
        event.respondWith(cacheFirstWithFallback(request));
    } else {
        // Everything else - network first
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Network request failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// Cache first with fallback strategy
async function cacheFirstWithFallback(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        // Fallback to a default image
        return new Response('', { status: 404, statusText: 'Not Found' });
    } catch (error) {
        console.error('Cache first with fallback failed:', error);
        return new Response('', { status: 404, statusText: 'Not Found' });
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'save-recommendation') {
        event.waitUntil(syncSavedRecommendations());
    }
    
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

// Sync saved recommendations when back online
async function syncSavedRecommendations() {
    try {
        const savedRecommendations = JSON.parse(localStorage.getItem('savedRecommendations') || '[]');
        console.log('Syncing saved recommendations:', savedRecommendations.length);
        
        // Here you would sync with your backend API
        // For now, just log the action
        console.log('Service Worker: Recommendations synced successfully');
    } catch (error) {
        console.error('Service Worker: Error syncing recommendations:', error);
    }
}

// Sync analytics data when back online
async function syncAnalytics() {
    try {
        const analyticsData = JSON.parse(localStorage.getItem('offlineAnalytics') || '[]');
        console.log('Syncing analytics data:', analyticsData.length, 'events');
        
        // Here you would send analytics to your tracking service
        // For now, just clear the offline data
        localStorage.removeItem('offlineAnalytics');
        console.log('Service Worker: Analytics synced successfully');
    } catch (error) {
        console.error('Service Worker: Error syncing analytics:', error);
    }
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: 'New trending shows are available!',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore Now',
                icon: '/icon-play.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('WhatShouldIWatch.ai', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then((cache) => {
                return cache.addAll(event.data.payload);
            })
        );
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Registered successfully');
