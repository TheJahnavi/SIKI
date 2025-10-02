// Service Worker for SIKI App

const CACHE_NAME = 'siki-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/manifest.json'
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

// Cache and network race
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open('siki-images-v1').then((cache) => {
        return cache.match(event.request).then((response) => {
          const networkFetch = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          
          // Return cached response if available, otherwise fetch from network
          return response || networkFetch;
        });
      })
    );
  }
  
  // For other requests, use the existing strategy
  if (event.request.destination === 'document' || event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          const networkFetch = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          
          // Return cached response if available, otherwise fetch from network
          return response || networkFetch;
        });
      })
    );
  }
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
        fiber: '4g'
      },
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
        fiber: '3g'
      },
      dietary: ['vegan', 'gluten-free']
    }
  ]
};

// Handle offline product requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For product analysis requests when offline
  if (url.pathname === '/api/analyze-product' && event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return fallback data when offline
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
      })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== 'siki-images-v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
