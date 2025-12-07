// Service Worker - MotoNavigator PWA
// Workbox stratejileri ile gelişmiş önbellekleme

const CACHE_NAME = 'moto-navigator-v1';
const RUNTIME_CACHE = 'moto-runtime-v1';

// Önbelleğe alınacak statik kaynaklar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/scripts/api.js',
  '/scripts/map.js',
  '/scripts/notifications.js',
  '/manifest.json',
  '/offline.html'
];

// API istekleri için önbellek stratejisi
const API_CACHE_STRATEGY = {
  // Hava durumu: Network First, 10 dakika önbellek
  weather: { strategy: 'NetworkFirst', cacheName: 'weather-cache', maxAge: 600000 },
  // Yakıt istasyonları: Network First, 5 dakika önbellek
  fuel: { strategy: 'NetworkFirst', cacheName: 'fuel-cache', maxAge: 300000 },
  // Trafik: Network First, 2 dakika önbellek
  traffic: { strategy: 'NetworkFirst', cacheName: 'traffic-cache', maxAge: 120000 },
  // Konum: Cache First (son bilinen konum)
  location: { strategy: 'CacheFirst', cacheName: 'location-cache', maxAge: 3600000 }
};

// Service Worker Kurulumu
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker kuruluyor...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Statik kaynaklar önbelleğe alınıyor...');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.error('[SW] Önbellekleme hatası:', err);
        });
      })
      .then(() => {
        // Eski cache'leri temizle
        return self.skipWaiting();
      })
  );
});

// Service Worker Aktivasyonu
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker aktifleştiriliyor...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Eski önbellek siliniyor:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch Event - Network First Stratejisi
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API istekleri için özel işleme
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request, url));
    return;
  }

  // Statik kaynaklar için Cache First
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Diğer istekler için Network First
  event.respondWith(handleNetworkFirst(request));
});

// API İsteklerini Yönet
async function handleAPIRequest(request, url) {
  const cacheName = getCacheNameForAPI(url.pathname);
  const cache = await caches.open(cacheName || RUNTIME_CACHE);

  try {
    // Önce ağdan dene
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Başarılı ise önbelleğe kaydet
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Ağ hatası, önbellekten getiriliyor:', error);
    
    // Önbellekten getir
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Önbellekte yoksa offline yanıtı döndür
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'İnternet bağlantısı yok ve önbellekte veri bulunamadı' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Statik Kaynak İsteklerini Yönet (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Offline sayfasına yönlendir
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    throw error;
  }
}

// Network First Stratejisi
async function handleNetworkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// API tipine göre önbellek adı
function getCacheNameForAPI(pathname) {
  if (pathname.includes('weather')) return 'weather-cache';
  if (pathname.includes('fuel')) return 'fuel-cache';
  if (pathname.includes('traffic')) return 'traffic-cache';
  if (pathname.includes('location')) return 'location-cache';
  return null;
}

// Push Notification Event
self.addEventListener('push', (event) => {
  console.log('[SW] Push bildirimi alındı:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MotoNavigator';
  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    data: data.data || {},
    requireInteraction: data.important || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Bildirime tıklandı:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  // Özel aksiyonlar
  if (action === 'view-fuel') {
    event.waitUntil(
      clients.openWindow('/fuel')
    );
  } else if (action === 'view-weather') {
    event.waitUntil(
      clients.openWindow('/weather')
    );
  } else {
    // Varsayılan: Ana sayfayı aç
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background Sync (gelecekte kullanım için)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-location') {
    event.waitUntil(syncLocationData());
  }
});

async function syncLocationData() {
  // Konum verilerini senkronize et
  console.log('[SW] Konum verileri senkronize ediliyor...');
}

