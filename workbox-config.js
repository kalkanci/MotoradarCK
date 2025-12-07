// Workbox Configuration - MotoNavigator PWA
// Service Worker generation için yapılandırma

module.exports = {
  globDirectory: './',
  globPatterns: [
    '**/*.{html,js,css,json,png,jpg,jpeg,svg,woff,woff2,ttf,eot}'
  ],
  swDest: './sw.js',
  swSrc: './sw.js', // Mevcut service worker'ı güncelle
  
  // Önbellekleme stratejileri
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'weather-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 10 * 60 // 10 dakika
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /^https:\/\/overpass-api\.de\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fuel-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 dakika
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.tomtom\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'traffic-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 2 * 60 // 2 dakika
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 gün
        }
      }
    },
    {
      urlPattern: /^https:\/\/unpkg\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'cdn-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 gün
        }
      }
    }
  ],
  
  // Ignore patterns
  globIgnores: [
    '**/node_modules/**',
    '**/.git/**',
    '**/README.md',
    '**/DEPLOYMENT.md',
    '**/API_REHBERI.md',
    '**/workbox-config.js',
    '**/package.json',
    '**/package-lock.json'
  ],
  
  // Manifest injection
  manifestTransforms: [
    // Manifest'i otomatik güncelle
  ],
  
  // Skip waiting
  skipWaiting: true,
  clientsClaim: true
};

