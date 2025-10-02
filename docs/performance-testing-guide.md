# Performance Testing Guide for SIKI Application

This guide provides instructions for testing and optimizing the performance of the SIKI application to ensure fast loading times and smooth user experience.

## 📊 Performance Targets

### Core Web Vitals (Mobile)
| Metric | Target | Description |
|--------|--------|-------------|
| Largest Contentful Paint (LCP) | < 2.5s | Time for largest content element to load |
| First Input Delay (FID) | < 100ms | Time from first user interaction to browser response |
| Cumulative Layout Shift (CLS) | < 0.1 | Visual stability of page content |

### Additional Metrics
| Metric | Target | Description |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 2s | Time for first content to appear |
| Speed Index | < 4.3s | How quickly content is visually populated |
| Time to Interactive (TTI) | < 5s | Time for page to become fully interactive |
| Total Blocking Time (TBT) | < 300ms | Sum of blocking time periods |

## 🧪 Testing Tools

### 1. Lighthouse (Chrome DevTools)
- Built into Chrome Developer Tools
- Provides Core Web Vitals scores
- Detailed performance recommendations
- Accessibility and SEO audits

### 2. WebPageTest
- Real browser testing from multiple locations
- Filmstrip view of page loading
- Connection speed simulation
- Detailed waterfall charts

### 3. PageSpeed Insights
- Google's performance analysis tool
- Mobile and desktop scores
- Optimization suggestions
- Field data from Chrome UX Report

### 4. GTmetrix
- Detailed performance reports
- Waterfall charts
- Video of page load
- Optimization recommendations

## 🔍 Performance Testing Procedures

### 1. Initial Baseline Testing
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Select Mobile device
4. Run audit on homepage
5. Record initial scores
6. Run audit on product analysis page
7. Record scores

### 2. Detailed Performance Analysis
1. Use WebPageTest with:
   - Mobile device simulation
   - 3G/4G connection speeds
   - Multiple test locations
2. Analyze waterfall chart
3. Identify bottlenecks
4. Check for render-blocking resources
5. Review filmstrip view

### 3. Field Data Collection
1. Set up Google Analytics
2. Enable Core Web Vitals reporting
3. Monitor real-user data
4. Compare with lab data
5. Identify performance regressions

## 🚀 Optimization Strategies

### 1. Image Optimization
```javascript
// In server.js - Enhanced image optimization
const sharp = require('sharp');

// Optimize uploaded images
async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(outputPath);
    console.log('Image optimized successfully');
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}
```

### 2. Code Splitting
```javascript
// In build process - Split large bundles
// webpack.config.js example
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### 3. Lazy Loading
```javascript
// In main.js - Lazy load non-critical resources
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
```

### 4. Service Worker Caching
```javascript
// Enhanced caching strategies in sw.js
// Cache strategies for different resource types
self.addEventListener('fetch', event => {
  // API requests - Network first with cache fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Static assets - Cache first with network update
  if (event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // Images - Cache first
  if (event.request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
});

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open('siki-api-cache');
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open('siki-static-cache').then(cache => {
          cache.put(request, response.clone());
        });
      }
    });
    return cachedResponse;
  }
  
  // Fetch from network if not in cache
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open('siki-static-cache');
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}
```

### 5. Compression and Minification
```javascript
// In build.js - Enhanced asset optimization
const terser = require('terser');
const CleanCSS = require('clean-css');

// JS minification
async function minifyJS(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await terser.minify(code, {
      compress: {
        drop_console: true,
        drop_debugger: true,
        ecma: 2015,
        passes: 2
      },
      mangle: {
        properties: {
          regex: /^_/,
        }
      }
    });
    fs.writeFileSync(filePath, result.code);
    console.log(`Minified JS: ${filePath}`);
  } catch (error) {
    console.warn(`Failed to minify JS ${filePath}:`, error.message);
  }
}

// CSS minification
function minifyCSS(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const output = new CleanCSS({
      level: 2,
      inline: ['all']
    }).minify(code);
    fs.writeFileSync(filePath, output.styles);
    console.log(`Minified CSS: ${filePath}`);
  } catch (error) {
    console.warn(`Failed to minify CSS ${filePath}:`, error.message);
  }
}
```

## 📈 Performance Monitoring

### 1. Real User Monitoring (RUM)
```javascript
// In main.js - Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      // Log Core Web Vitals
      console.log('LCP:', performance.getEntriesByName('largest-contentful-paint')[0]);
      console.log('FID:', performance.getEntriesByType('first-input')[0]);
      console.log('CLS:', calculateCLS());
      
      // Send to analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_metrics', {
          lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
          fid: performance.getEntriesByType('first-input')[0]?.processingStart || 0,
          cls: calculateCLS()
        });
      }
    }, 0);
  });
}

function calculateCLS() {
  let clsValue = 0;
  let clsEntries = [];
  
  if ('LayoutShift' in window) {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  return clsValue;
}
```

### 2. Resource Loading Monitoring
```javascript
// Monitor resource loading performance
if ('performance' in window) {
  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource');
    
    // Log slow resources (> 1s)
    resources.forEach(resource => {
      if (resource.duration > 1000) {
        console.warn('Slow resource:', resource.name, resource.duration);
      }
    });
  });
}
```

## 🛠 Performance Testing Checklist

### Pre-Deployment Testing
- [ ] Lighthouse audit score > 90 (mobile)
- [ ] Lighthouse audit score > 95 (desktop)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] First-party JavaScript < 500KB
- [ ] Third-party JavaScript < 100KB
- [ ] Images optimized (WebP where supported)
- [ ] Fonts loaded efficiently
- [ ] Critical CSS inlined
- [ ] Non-critical CSS loaded asynchronously
- [ ] JavaScript loaded asynchronously where possible
- [ ] Service worker caching implemented
- [ ] Lazy loading for images and iframes
- [ ] Preloading critical resources

### Ongoing Monitoring
- [ ] Set up Core Web Vitals monitoring
- [ ] Monitor performance in Google Search Console
- [ ] Set up performance budgets
- [ ] Regular performance audits
- [ ] Monitor user experience metrics
- [ ] Track performance regressions
- [ ] A/B test performance improvements

## 📊 Performance Budget

### Asset Size Limits
| Resource Type | Size Limit | Compression |
|---------------|------------|-------------|
| HTML | 50KB | Gzip |
| CSS | 100KB | Gzip |
| JavaScript (First Party) | 500KB | Terser + Gzip |
| JavaScript (Third Party) | 100KB | Terser + Gzip |
| Images | 200KB (avg) | WebP/WebM |
| Fonts | 50KB (each) | WOFF2 |

### Network Request Limits
| Connection Type | Request Limit |
|-----------------|---------------|
| Mobile 3G | < 50 requests |
| Mobile 4G | < 75 requests |
| Desktop | < 100 requests |

## 🚨 Performance Anti-Patterns to Avoid

### 1. Render-Blocking Resources
```html
<!-- Bad: Blocking CSS -->
<link rel="stylesheet" href="styles.css">

<!-- Good: Non-blocking CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 2. Large JavaScript Bundles
```javascript
// Bad: Large monolithic bundle
import { everything } from './huge-library.js';

// Good: Code splitting
import('./feature-module.js').then(module => {
  module.init();
});
```

### 3. Unoptimized Images
```html
<!-- Bad: Large unoptimized image -->
<img src="photo.jpg" alt="Product">

<!-- Good: Responsive, optimized image -->
<picture>
  <source srcset="photo.webp" type="image/webp">
  <source srcset="photo.jpg" type="image/jpeg">
  <img src="photo.jpg" alt="Product" loading="lazy" width="400" height="300">
</picture>
```

## 📋 Final Performance Review

Before public release, verify all performance requirements are met:

### Essential Requirements
- [ ] Core Web Vitals scores within targets
- [ ] Page load time < 3s (mobile)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] JavaScript bundle size < 500KB
- [ ] Images optimized and compressed
- [ ] Service worker caching implemented
- [ ] Lazy loading for non-critical resources

### Enhanced Requirements
- [ ] Performance monitoring in place
- [ ] Performance budgets defined and enforced
- [ ] Regular performance audits scheduled
- [ ] User experience metrics tracked
- [ ] Performance regression alerts configured
- [ ] A/B testing for performance improvements

This guide should be used throughout development and before each release to ensure the SIKI application maintains excellent performance for all users.