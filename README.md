# MotoNavigator - Motosiklet Seyahat Asistanı PWA

Motosiklet sürücüleri için tasarlanmış, gerçek zamanlı veri entegrasyonlu, offline destekli akıllı navigasyon ve seyahat asistanı Progressive Web App.

## 🏍️ Özellikler

### Temel Özellikler
- **Gerçek Zamanlı Navigasyon**: GPS tabanlı konum takibi ve harita görüntüleme
- **Hava Durumu Entegrasyonu**: Motosiklet sürücüleri için özel hava analizi
- **Yakıt İstasyonu Bulucu**: En yakın yakıt istasyonlarını keşfetme
- **Trafik Durumu**: Anlık trafik bilgisi ve alternatif rota önerileri
- **Offline Desteği**: İnternet bağlantısı olmadan da çalışma
- **Push Bildirimleri**: Önemli uyarılar için anlık bildirimler

### Motosiklet Odaklı Özellikler
- **Rüzgar ve Yağmur Analizi**: Motosiklet sürüşü için risk değerlendirmesi
- **Bakım Takip Sistemi**: Zincir yağlama, lastik basıncı, yağ değişimi hatırlatıcıları
- **Güvenlik Skoru**: Rota güvenliği değerlendirmesi
- **Acil Durum Modu**: Tek tıkla konum paylaşımı
- **Kask Hatırlatıcısı**: Düzenli kask kontrolü

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 16+ (geliştirme için)
- Modern web tarayıcı (Chrome, Safari, Firefox, Edge)
- HTTPS bağlantısı (PWA özellikleri için)

### Kurulum

1. **Projeyi klonlayın veya indirin**
```bash
cd "Moto PWA"
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

4. **Tarayıcıda açın**
```
http://localhost:8080
```

### Production Build

```bash
npm run build
```

## 📱 PWA Kurulumu

### Android
1. Chrome tarayıcısında uygulamayı açın
2. Menüden "Ana ekrana ekle" seçeneğini seçin
3. Uygulama ana ekranınıza eklenecektir

### iOS
1. Safari tarayıcısında uygulamayı açın
2. Paylaşım butonuna tıklayın
3. "Ana Ekrana Ekle" seçeneğini seçin

## 🔑 API Anahtarları

Uygulama çalışması için aşağıdaki API anahtarlarını yapılandırmanız gerekir:

### 1. OpenWeatherMap API
- **Kayıt**: https://openweathermap.org/api
- **Ücretsiz Tier**: 1,000 çağrı/gün
- **Kullanım**: Hava durumu verileri

**Yapılandırma**: `scripts/api.js` dosyasında `apiKeys.openWeather` değerini güncelleyin.

### 2. OpenRouteService API (Opsiyonel)
- **Kayıt**: https://openrouteservice.org/
- **Ücretsiz Tier**: 2,000 çağrı/gün
- **Kullanım**: Rota planlama

**Yapılandırma**: `scripts/api.js` dosyasında `apiKeys.openRouteService` değerini güncelleyin.

### 3. TomTom Traffic API (Opsiyonel)
- **Kayıt**: https://developer.tomtom.com/
- **Ücretsiz Tier**: 2,500 çağrı/gün
- **Kullanım**: Trafik verileri

**Yapılandırma**: `scripts/api.js` dosyasında `apiKeys.tomtom` değerini güncelleyin.

### 4. VAPID Keys (Push Notifications)
- **Oluşturma**: `npm install -g web-push` sonra `web-push generate-vapid-keys`
- **Kullanım**: Push notification abonelikleri

**Yapılandırma**: 
- `scripts/notifications.js` dosyasında `YOUR_VAPID_PUBLIC_KEY` değerini güncelleyin
- Backend'de private key'i saklayın

## 🏗️ Mimari

### Frontend
- **Vanilla JavaScript**: Framework bağımlılığı yok
- **Leaflet.js**: Harita görüntüleme (CDN)
- **Service Worker**: Offline desteği ve önbellekleme
- **Web APIs**: Geolocation, Notifications, Push

### Backend (Opsiyonel)
- Push notification sunucusu
- Kullanıcı verileri senkronizasyonu
- Rota geçmişi saklama

### Veri Kaynakları
- **OpenStreetMap**: Yakıt istasyonları (Overpass API)
- **OpenWeatherMap**: Hava durumu
- **OpenRouteService**: Rota planlama
- **TomTom**: Trafik verileri

## 📂 Proje Yapısı

```
Moto PWA/
├── index.html              # Ana HTML dosyası
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── offline.html            # Offline sayfası
├── package.json            # NPM yapılandırması
├── styles/
│   └── main.css            # Ana stil dosyası
├── scripts/
│   ├── app.js              # Ana uygulama mantığı
│   ├── api.js              # API entegrasyonları
│   ├── map.js              # Harita yönetimi
│   └── notifications.js   # Bildirim yönetimi
└── icons/                  # PWA ikonları (oluşturulmalı)
```

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Arka Plan**: #000000 (Siyah)
- **Kartlar**: rgba(255, 255, 255, 0.05) (Yarı saydam beyaz)
- **Vurgu**: #007AFF (iOS Mavi)
- **Uyarı**: #FF9500 (Turuncu)
- **Tehlike**: #FF3B30 (Kırmızı)

### Tipografi
- **Font**: SF Pro Display (Apple), system fonts fallback
- **Boyutlar**: 11px - 28px arası responsive

### Bileşenler
- **Widget'lar**: Yuvarlatılmış köşeler, blur efektli arka plan
- **Navigasyon**: Alt sabit bar, iOS tarzı
- **Animasyonlar**: Yumuşak geçişler, 150-350ms

## 🔧 Özelleştirme

### Hava Durumu Uyarı Eşikleri
`scripts/api.js` dosyasında `analyzeWeatherForMotorcycle` fonksiyonunu düzenleyin:
- Rüzgar hızı: 30 km/h (orta), 50 km/h (yüksek)
- Görüş mesafesi: 3 km (sınırlı), 1 km (düşük)
- Sıcaklık: 10°C (soğuk), 5°C (buzlanma riski)

### Bakım Aralıkları
`scripts/app.js` dosyasında `MaintenanceTracker` sınıfında:
- Zincir yağlama: 500 km
- Lastik basıncı: 7 gün
- Yağ değişimi: 5000 km
- Kask kontrolü: 30 gün

### Önbellek Stratejileri
`sw.js` dosyasında:
- Hava durumu: 10 dakika
- Yakıt istasyonları: 5 dakika
- Trafik: 2 dakika
- Konum: 1 saat

## 🚢 Deployment

### GitHub Pages
1. Repository'yi GitHub'a push edin
2. Settings > Pages > Source: main branch
3. HTTPS URL'i kullanın

### Netlify
1. Netlify hesabı oluşturun
2. "New site from Git" seçin
3. Repository'yi bağlayın
4. Build command: `npm run build`
5. Publish directory: `.`

### Vercel
1. Vercel hesabı oluşturun
2. "Import Project" seçin
3. Repository'yi bağlayın
4. Framework Preset: Other
5. Deploy edin

### Özel Sunucu
1. Dosyaları sunucuya yükleyin
2. HTTPS sertifikası kurun (Let's Encrypt)
3. Service Worker'ın çalıştığından emin olun
4. Cache headers yapılandırın

## 📊 Performans

### Önbellekleme
- Statik kaynaklar: Cache First
- API istekleri: Network First
- Offline fallback: Son bilinen veriler

### Optimizasyon
- Lazy loading: Harita kütüphanesi
- Image optimization: WebP formatı
- Code splitting: Modüler yapı
- Compression: Gzip/Brotli

## 🐛 Bilinen Sorunlar

1. **Leaflet.js CDN**: İnternet bağlantısı gerektirir
   - **Çözüm**: Leaflet.js'i local'e indirin

2. **iOS Safari**: Service Worker bazı özelliklerde sınırlı
   - **Çözüm**: iOS 16.4+ güncellemesi gerekli

3. **API Rate Limits**: Ücretsiz tier'lar sınırlı
   - **Çözüm**: Önbellekleme stratejilerini optimize edin

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

## 📞 Destek

Sorularınız için:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Email: support@motonavigator.com

## 🙏 Teşekkürler

- OpenStreetMap topluluğu
- OpenWeatherMap
- Leaflet.js geliştiricileri
- Tüm açık kaynak katkıda bulunanlar

---

**MotoNavigator** - Motosiklet sürücüleri için güvenli ve akıllı seyahat 🏍️

