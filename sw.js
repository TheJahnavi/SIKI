// Service Worker for SIKI App

const CACHE_NAME = 'siki-cache-v2';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Enhanced fetch event handler with better caching strategies
self.addEventListener('fetch', event => {
  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open('siki-api-cache').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return fallback data when offline
            const url = new URL(event.request.url);
            
            // Handle different API endpoints with specific fallbacks
            if (url.pathname === '/api/analyze-product' && event.request.method === 'POST') {
              return new Response(
                JSON.stringify({
                  success: true,
                  product: FALLBACK_DATA.products[0],
                  productId: 'offline-' + Date.now()
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            if (url.pathname === '/api/chat') {
              return new Response(
                JSON.stringify({
                  success: true,
                  reply: "I'm currently offline. I can provide general health information about products when you're back online."
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            if (url.pathname === '/api/history') {
              return new Response(
                JSON.stringify({
                  success: true,
                  history: FALLBACK_DATA.products.slice(0, 5)
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            // Generic fallback for other API requests
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Network error - offline mode'
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }
  
  // Handle image requests with cache-first strategy
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open('siki-images-v1').then(cache => {
        return cache.match(event.request).then(response => {
          // Return cached response if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // Handle document, script, and style requests with stale-while-revalidate
  if (event.request.destination === 'document' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          // Fetch from network in background to update cache
          const networkFetch = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          
          // Return cached response if available, otherwise wait for network
          return cachedResponse || networkFetch;
        });
      })
    );
    return;
  }
  
  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached response if available
        return caches.match(event.request);
      })
  );
});

// Offline fallback data
const FALLBACK_DATA = {
  products: [
    {
      id: 'offline-apple',
      name: 'Apple',
      score: 95,
      category: 'Raw Food',
      message: 'High in fiber and antioxidants. A healthy snack option.',
      nutrition: {
        calories: '95 per medium apple',
        sugar: '19g',
        fiber: '4g',
        protein: '1g'
      },
      ingredients: ['Apple'],
      allergens: [],
      dietary: ['vegan', 'gluten-free', 'keto-friendly in moderation']
    },
    {
      id: 'offline-banana',
      name: 'Banana',
      score: 90,
      category: 'Raw Food',
      message: 'Rich in potassium and vitamins. Great for energy.',
      nutrition: {
        calories: '105 per medium banana',
        sugar: '14g',
        fiber: '3g',
        protein: '1g'
      },
      ingredients: ['Banana'],
      allergens: [],
      dietary: ['vegan', 'gluten-free']
    },
    {
      id: 'offline-orange',
      name: 'Orange',
      score: 85,
      category: 'Raw Food',
      message: 'High in vitamin C and fiber. Supports immune system.',
      nutrition: {
        calories: '62 per medium orange',
        sugar: '12g',
        fiber: '3g',
        protein: '1g'
      },
      ingredients: ['Orange'],
      allergens: [],
      dietary: ['vegan', 'gluten-free', 'keto-friendly in moderation']
    }
  ]
};

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== 'siki-images-v1' && 
              cacheName !== 'siki-api-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});