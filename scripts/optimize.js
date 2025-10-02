// Optimization script for SIKI App
// This script handles image compression, lazy loading setup, and other performance optimizations

const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image compression

// Function to compress images
async function compressImages() {
  try {
    console.log('Starting image compression...');
    
    // Check if sharp is available
    if (!sharp) {
      console.log('Sharp library not available, skipping image compression');
      return;
    }
    
    // Define image directories
    const imageDirs = [
      path.join(__dirname, '..', 'icons'),
      path.join(__dirname, '..', 'uploads') // If any sample images exist
    ];
    
    // Process each directory
    for (const dir of imageDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          // Process only image files
          if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            const filePath = path.join(dir, file);
            const compressedPath = path.join(dir, `compressed-${file}`);
            
            try {
              // Compress image with 80% quality
              await sharp(filePath)
                .jpeg({ quality: 80 })
                .png({ quality: 80 })
                .webp({ quality: 80 })
                .toFile(compressedPath);
              
              console.log(`Compressed ${file}`);
            } catch (error) {
              console.warn(`Failed to compress ${file}:`, error.message);
            }
          }
        }
      }
    }
    
    console.log('Image compression completed!');
  } catch (error) {
    console.error('Image compression failed:', error);
  }
}

// Function to implement lazy loading in HTML
function implementLazyLoading() {
  try {
    console.log('Implementing lazy loading...');
    
    // Read the index.html file
    const indexPath = path.join(__dirname, '..', 'index.html');
    if (fs.existsSync(indexPath)) {
      let htmlContent = fs.readFileSync(indexPath, 'utf8');
      
      // Add loading="lazy" attribute to all img tags
      htmlContent = htmlContent.replace(/<img([^>]*?)>/g, (match, attrs) => {
        // If loading attribute already exists, don't add it again
        if (attrs.includes('loading=')) {
          return match;
        }
        // Add loading="lazy" attribute
        return `<img${attrs} loading="lazy">`;
      });
      
      // Write back the modified HTML
      fs.writeFileSync(indexPath, htmlContent, 'utf8');
      console.log('Lazy loading implemented in index.html');
    }
    
    console.log('Lazy loading implementation completed!');
  } catch (error) {
    console.error('Lazy loading implementation failed:', error);
  }
}

// Function to generate service worker caching strategies
function optimizeServiceWorker() {
  try {
    console.log('Optimizing service worker...');
    
    // Read the service worker file
    const swPath = path.join(__dirname, '..', 'sw.js');
    if (fs.existsSync(swPath)) {
      let swContent = fs.readFileSync(swPath, 'utf8');
      
      // Add more specific caching strategies
      const cachingStrategies = `
// Cache images with a longer expiration
self.addEventListener('fetch', (event) => {
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
`;
      
      // Append the caching strategies to the service worker
      swContent = swContent.replace(
        '// Cache and network race',
        `${cachingStrategies}\n// Cache and network race`
      );
      
      // Write back the modified service worker
      fs.writeFileSync(swPath, swContent, 'utf8');
      console.log('Service worker optimized');
    }
    
    console.log('Service worker optimization completed!');
  } catch (error) {
    console.error('Service worker optimization failed:', error);
  }
}

// Function to implement offline fallback data caching
function implementOfflineCaching() {
  try {
    console.log('Implementing offline caching...');
    
    // Read the service worker file
    const swPath = path.join(__dirname, '..', 'sw.js');
    if (fs.existsSync(swPath)) {
      let swContent = fs.readFileSync(swPath, 'utf8');
      
      // Add offline fallback caching
      const offlineCaching = `
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
`;
      
      // Append the offline caching to the service worker
      // Insert before the last line (self.addEventListener('activate'))
      const lines = swContent.split('\n');
      lines.splice(-3, 0, offlineCaching);
      swContent = lines.join('\n');
      
      // Write back the modified service worker
      fs.writeFileSync(swPath, swContent, 'utf8');
      console.log('Offline caching implemented');
    }
    
    console.log('Offline caching implementation completed!');
  } catch (error) {
    console.error('Offline caching implementation failed:', error);
  }
}

// Main optimization function
async function optimize() {
  console.log('Starting SIKI app optimization...');
  
  // 1. Compress images
  await compressImages();
  
  // 2. Implement lazy loading
  implementLazyLoading();
  
  // 3. Optimize service worker
  optimizeServiceWorker();
  
  // 4. Implement offline caching
  implementOfflineCaching();
  
  console.log('All optimizations completed!');
}

// Run optimization if this script is executed directly
if (require.main === module) {
  optimize();
}

module.exports = { 
  compressImages, 
  implementLazyLoading, 
  optimizeServiceWorker, 
  implementOfflineCaching, 
  optimize 
};