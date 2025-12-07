# API Entegrasyon Rehberi - MotoNavigator PWA

Bu dokümantasyon, MotoNavigator PWA'da kullanılan API'lerin detaylı entegrasyon bilgilerini içerir.

## 📋 İçindekiler

1. [Hava Durumu API](#hava-durumu-api)
2. [Yakıt İstasyonları API](#yakıt-istasyonları-api)
3. [Trafik API](#trafik-api)
4. [Rota Planlama API](#rota-planlama-api)
5. [Konum API](#konum-api)
6. [Önbellekleme Stratejileri](#önbellekleme-stratejileri)
7. [Hata Yönetimi](#hata-yönetimi)

---

## 🌤️ Hava Durumu API

### OpenWeatherMap API

**Endpoint**: `https://api.openweathermap.org/data/2.5/weather`

**Kayıt**: https://openweathermap.org/api

**Ücretsiz Tier**:
- 1,000 çağrı/gün
- 60 çağrı/dakika
- Current Weather Data

**Kullanım Örneği**:
```javascript
const apiKey = 'YOUR_API_KEY';
const lat = 41.0082;
const lon = 28.9784;

const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log('Hava Durumu:', data);
  });
```

**Yanıt Formatı**:
```json
{
  "main": {
    "temp": 22.5,
    "humidity": 65,
    "pressure": 1013
  },
  "weather": [{
    "main": "Clear",
    "description": "açık",
    "icon": "01d"
  }],
  "wind": {
    "speed": 3.5,
    "deg": 180
  },
  "visibility": 10000,
  "clouds": {
    "all": 20
  }
}
```

**Motosiklet Analizi**:
- Rüzgar hızı > 50 km/h → Yüksek risk
- Rüzgar hızı > 30 km/h → Orta risk
- Yağmur var → Yol kaygan uyarısı
- Görüş < 1 km → Düşük görüş uyarısı
- Sıcaklık < 5°C → Buzlanma riski

**Önbellekleme**: 10 dakika

---

## ⛽ Yakıt İstasyonları API

### Overpass API (OpenStreetMap)

**Endpoint**: `https://overpass-api.de/api/interpreter`

**Kayıt**: Gerekmez (açık kaynak)

**Rate Limit**: 
- 10,000 node/sorgu
- 1 sorgu/saniye (önerilen)

**Kullanım Örneği**:
```javascript
const lat = 41.0082;
const lon = 28.9784;
const radius = 5000; // 5 km

const query = `
  [out:json][timeout:25];
  (
    node["amenity"="fuel"](around:${radius},${lat},${lon});
  );
  out body;
  >;
  out skel qt;
`;

const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const stations = data.elements
      .filter(el => el.type === 'node' && el.tags)
      .map(el => ({
        name: el.tags.name || 'Yakıt İstasyonu',
        lat: el.lat,
        lon: el.lon,
        brand: el.tags.brand || null
      }));
  });
```

**Alternatif API'ler**:
- **Google Places API**: Ücretli, daha detaylı
- **HERE Places API**: Ücretsiz tier mevcut
- **Foursquare API**: Ücretsiz tier mevcut

**Önbellekleme**: 5 dakika

---

## 🚦 Trafik API

### TomTom Traffic Flow API

**Endpoint**: `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`

**Kayıt**: https://developer.tomtom.com/

**Ücretsiz Tier**:
- 2,500 çağrı/gün
- Traffic Flow API

**Kullanım Örneği**:
```javascript
const apiKey = 'YOUR_API_KEY';
const lat = 41.0082;
const lon = 28.9784;

const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const speed = data.flowSegmentData.currentSpeed;
    const freeFlowSpeed = data.flowSegmentData.freeFlowSpeed;
    const level = speed < 20 ? 'heavy' : speed < 40 ? 'moderate' : 'normal';
  });
```

**Alternatif API'ler**:
- **HERE Traffic API**: Ücretsiz tier mevcut
- **Google Maps Traffic**: Ücretli
- **Mapbox Traffic**: Ücretli

**Fallback Stratejisi**: Saat bazlı tahmin (yoğun saatler: 07-09, 17-19)

**Önbellekleme**: 2 dakika

---

## 🛣️ Rota Planlama API

### OpenRouteService API

**Endpoint**: `https://api.openrouteservice.org/v2/directions/{profile}`

**Kayıt**: https://openrouteservice.org/

**Ücretsiz Tier**:
- 2,000 çağrı/gün
- Directions API

**Kullanım Örneği**:
```javascript
const apiKey = 'YOUR_API_KEY';
const profile = 'driving-car'; // veya 'cycling-regular' (virajlı yollar için)
const start = { lat: 41.0082, lon: 28.9784 };
const end = { lat: 41.0123, lon: 28.9876 };

const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const route = data.features[0];
    const distance = route.properties.segments[0].distance / 1000; // km
    const duration = route.properties.segments[0].duration / 60; // dakika
    const geometry = route.geometry.coordinates;
  });
```

**Profil Seçenekleri**:
- `driving-car`: Standart araba rotası
- `cycling-regular`: Virajlı, manzaralı rotalar (motosiklet için ideal)
- `driving-hgv`: Otoyol odaklı

**Güvenlik Skoru Hesaplama**:
```javascript
function calculateRouteSafety(route, weather, traffic) {
  let score = 100;
  
  // Hava durumu: -30 (yüksek risk), -15 (orta risk)
  if (weather.motorcycleRisk === 'high') score -= 30;
  else if (weather.motorcycleRisk === 'medium') score -= 15;
  
  // Trafik: -20 (yoğun), -10 (orta)
  if (traffic.level === 'heavy') score -= 20;
  else if (traffic.level === 'moderate') score -= 10;
  
  // Mesafe: -10 (100+ km)
  const distance = route.properties.segments[0].distance / 1000;
  if (distance > 100) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}
```

**Alternatif API'ler**:
- **Google Directions API**: Ücretli, çok detaylı
- **HERE Routing API**: Ücretsiz tier mevcut
- **Mapbox Directions API**: Ücretli

---

## 📍 Konum API

### Web Geolocation API

**Kullanım**: Tarayıcı native API

**Kullanım Örneği**:
```javascript
// Tek seferlik konum
navigator.geolocation.getCurrentPosition(
  (position) => {
    const location = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  },
  (error) => {
    console.error('Konum hatası:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  }
);

// Sürekli takip
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    // Her konum güncellemesinde
  },
  (error) => {
    // Hata durumunda
  }
);

// Takibi durdur
navigator.geolocation.clearWatch(watchId);
```

**İzin Yönetimi**:
- Tarayıcı otomatik izin ister
- HTTPS gereklidir
- iOS Safari'de ekstra izin gerekebilir

**Önbellekleme**: 1 saat (son bilinen konum)

---

## 💾 Önbellekleme Stratejileri

### Service Worker Stratejileri

**1. Cache First (Statik Kaynaklar)**
```javascript
// HTML, CSS, JS, görseller
cache.match(request) || fetch(request)
```

**2. Network First (API İstekleri)**
```javascript
// Hava durumu, yakıt, trafik
fetch(request)
  .then(response => cache.put(request, response.clone()))
  .catch(() => cache.match(request))
```

**3. Stale While Revalidate**
```javascript
// Arka planda güncelle, önbellekten göster
cache.match(request) || fetch(request)
  .then(response => cache.put(request, response.clone()))
```

### Önbellek Süreleri

| Veri Tipi | Süre | Strateji |
|-----------|------|----------|
| Hava Durumu | 10 dakika | Network First |
| Yakıt İstasyonları | 5 dakika | Network First |
| Trafik | 2 dakika | Network First |
| Konum | 1 saat | Cache First |
| Statik Dosyalar | 1 hafta | Cache First |

### Önbellek Temizleme

```javascript
// Eski önbellekleri temizle
caches.keys().then(names => {
  names.forEach(name => {
    if (name !== CURRENT_CACHE) {
      caches.delete(name);
    }
  });
});
```

---

## ⚠️ Hata Yönetimi

### Retry Mekanizması

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Fallback Veriler

```javascript
// API başarısız olursa son bilinen veriyi kullan
async function getWeatherWithFallback(lat, lon) {
  try {
    const weather = await apiManager.getWeather(lat, lon);
    return weather;
  } catch (error) {
    const cached = apiManager.getLastKnown('weather');
    if (cached) {
      return { ...cached, cached: true, error: 'offline' };
    }
    throw error;
  }
}
```

### Hata Bildirimleri

```javascript
// Kullanıcıya hata bildir
function handleAPIError(error, context) {
  console.error(`[API Error] ${context}:`, error);
  
  app.showToast(
    'Veri yüklenirken bir hata oluştu. Son bilinen veriler gösteriliyor.',
    'warning'
  );
}
```

---

## 🔒 Güvenlik

### API Anahtarı Yönetimi

**❌ YANLIŞ**: Anahtarları kodda hardcode etme
```javascript
const apiKey = 'abc123...'; // GÜVENSİZ!
```

**✅ DOĞRU**: Environment variables kullan
```javascript
const apiKey = process.env.OPENWEATHER_API_KEY;
```

**Production'da**:
- Backend proxy kullan
- API anahtarlarını sunucuda sakla
- Rate limiting uygula

### CORS Yapılandırması

Bazı API'ler CORS gerektirir. Backend proxy kullanın veya API sağlayıcının CORS politikasını kontrol edin.

---

## 📊 Rate Limit Yönetimi

### İstek Sınırlaması

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async check() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.timeWindow - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

// Kullanım
const limiter = new RateLimiter(60, 60000); // 60 istek/dakika
await limiter.check();
const response = await fetch(url);
```

---

## 🧪 Test

### Mock API Responses

```javascript
// Test için mock veriler
const mockWeather = {
  temperature: 22,
  condition: 'açık',
  windSpeed: 15,
  rainRisk: 0
};

// Development modunda
if (process.env.NODE_ENV === 'development') {
  return mockWeather;
}
```

---

## 📚 Ek Kaynaklar

- [OpenWeatherMap Docs](https://openweathermap.org/api)
- [OpenRouteService Docs](https://openrouteservice.org/dev/#/api-docs)
- [TomTom Developer Portal](https://developer.tomtom.com/)
- [Web Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Not**: Tüm API anahtarlarını production'da güvenli bir şekilde saklayın ve rate limit'lere dikkat edin.

