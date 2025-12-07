# Deployment Rehberi - MotoNavigator PWA

Bu rehber, MotoNavigator PWA'yı production ortamına deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- ✅ HTTPS sertifikası (PWA için zorunlu)
- ✅ Modern web sunucusu (Nginx, Apache, vb.)
- ✅ API anahtarları yapılandırılmış
- ✅ Domain adı (opsiyonel ama önerilir)

---

## 🚀 Deployment Seçenekleri

### 1. GitHub Pages (Ücretsiz)

**Avantajlar**:
- Ücretsiz
- Otomatik HTTPS
- Kolay kurulum

**Adımlar**:

1. **Repository'yi GitHub'a push edin**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/moto-navigator.git
git push -u origin main
```

2. **GitHub Settings'e gidin**
   - Repository > Settings > Pages
   - Source: `main` branch
   - Folder: `/ (root)`
   - Save

3. **HTTPS URL'i kopyalayın**
   - `https://username.github.io/moto-navigator/`

4. **Manifest ve Service Worker'ı güncelleyin**
   - `manifest.json` içinde `start_url` ve `scope` değerlerini kontrol edin
   - `sw.js` içinde cache path'lerini kontrol edin

**Not**: GitHub Pages'de Service Worker çalışır, ancak bazı özellikler sınırlı olabilir.

---

### 2. Netlify (Önerilen)

**Avantajlar**:
- Ücretsiz tier
- Otomatik HTTPS
- CDN desteği
- Continuous Deployment

**Adımlar**:

1. **Netlify hesabı oluşturun**
   - https://app.netlify.com/signup

2. **"New site from Git" seçin**
   - GitHub, GitLab veya Bitbucket bağlayın

3. **Build ayarları**
   - Build command: `npm run build` (veya boş bırakın)
   - Publish directory: `.` (root)

4. **Environment variables ekleyin**
   - Site settings > Environment variables
   - API anahtarlarını ekleyin (opsiyonel)

5. **Deploy edin**
   - Netlify otomatik deploy edecek
   - Custom domain ekleyebilirsiniz

**Netlify.toml örneği**:
```toml
[build]
  publish = "."
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[headers]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

---

### 3. Vercel

**Avantajlar**:
- Ücretsiz tier
- Otomatik HTTPS
- Edge Network
- Kolay kurulum

**Adımlar**:

1. **Vercel hesabı oluşturun**
   - https://vercel.com/signup

2. **"Import Project" seçin**
   - GitHub repository'yi bağlayın

3. **Framework Preset**: Other
   - Build Command: `npm run build` (veya boş)
   - Output Directory: `.`

4. **Deploy edin**

**vercel.json örneği**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

### 4. Özel Sunucu (VPS/Dedicated)

**Gereksinimler**:
- Linux sunucu (Ubuntu önerilir)
- Nginx veya Apache
- Node.js (opsiyonel)
- SSL sertifikası (Let's Encrypt)

**Adımlar**:

#### A. Dosyaları Sunucuya Yükleyin

```bash
# SCP ile
scp -r * user@server:/var/www/moto-navigator/

# veya Git ile
git clone https://github.com/username/moto-navigator.git
cd moto-navigator
```

#### B. Nginx Yapılandırması

`/etc/nginx/sites-available/moto-navigator`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # HTTPS'e yönlendir
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    root /var/www/moto-navigator;
    index index.html;
    
    # SSL Sertifikaları
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache headers
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### C. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Sertifika al
sudo certbot --nginx -d yourdomain.com

# Otomatik yenileme
sudo certbot renew --dry-run
```

#### D. Nginx'i Aktifleştirin

```bash
sudo ln -s /etc/nginx/sites-available/moto-navigator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 Production Yapılandırması

### 1. API Anahtarlarını Güncelleyin

`scripts/api.js` dosyasında:
```javascript
this.apiKeys = {
  openWeather: process.env.OPENWEATHER_API_KEY || 'YOUR_KEY',
  here: process.env.HERE_API_KEY || 'YOUR_KEY',
  tomtom: process.env.TOMTOM_API_KEY || 'YOUR_KEY'
};
```

### 2. Manifest'i Güncelleyin

`manifest.json`:
```json
{
  "start_url": "https://yourdomain.com/",
  "scope": "https://yourdomain.com/"
}
```

### 3. Service Worker'ı Güncelleyin

`sw.js` içinde cache path'lerini kontrol edin:
```javascript
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // ... diğer path'ler
];
```

### 4. Environment Variables

Netlify/Vercel'de:
- `OPENWEATHER_API_KEY`
- `HERE_API_KEY`
- `TOMTOM_API_KEY`

---

## 📱 PWA Test Checklist

Deployment sonrası test edin:

- [ ] HTTPS çalışıyor mu?
- [ ] Service Worker kaydediliyor mu?
- [ ] Manifest yükleniyor mu?
- [ ] "Ana ekrana ekle" çalışıyor mu?
- [ ] Offline mod çalışıyor mu?
- [ ] Push notifications çalışıyor mu?
- [ ] Konum izni alınıyor mu?
- [ ] API'ler çalışıyor mu?
- [ ] Harita yükleniyor mu?

---

## 🐛 Sorun Giderme

### Service Worker Çalışmıyor

**Sorun**: Service Worker kaydedilmiyor

**Çözüm**:
- HTTPS kullandığınızdan emin olun
- Service Worker dosyasının root'ta olduğunu kontrol edin
- Browser console'da hataları kontrol edin

### Manifest Yüklenmiyor

**Sorun**: "Add to Home Screen" görünmüyor

**Çözüm**:
- Manifest.json'ın geçerli JSON olduğunu kontrol edin
- Icon path'lerinin doğru olduğundan emin olun
- Chrome DevTools > Application > Manifest'i kontrol edin

### API İstekleri Başarısız

**Sorun**: CORS hatası veya 401/403

**Çözüm**:
- API anahtarlarının doğru olduğunu kontrol edin
- CORS ayarlarını kontrol edin
- Rate limit'leri kontrol edin

### Offline Mod Çalışmıyor

**Sorun**: Offline'da sayfa yüklenmiyor

**Çözüm**:
- Service Worker'ın aktif olduğunu kontrol edin
- Cache stratejilerini kontrol edin
- Network tab'de offline simülasyonu yapın

---

## 📊 Performans Optimizasyonu

### 1. Gzip Compression

Nginx'te:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. Cache Headers

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN Kullanımı

- Statik dosyalar için CDN (Cloudflare, jsDelivr)
- Leaflet.js CDN kullanımı

### 4. Image Optimization

- WebP formatı kullanın
- Lazy loading ekleyin
- Responsive images

---

## 🔒 Güvenlik

### 1. Security Headers

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### 2. API Key Güvenliği

- API anahtarlarını kodda hardcode etmeyin
- Environment variables kullanın
- Backend proxy kullanın (önerilir)

### 3. HTTPS Zorunluluğu

```nginx
# HTTP'den HTTPS'e yönlendir
return 301 https://$server_name$request_uri;
```

---

## 📈 Monitoring

### 1. Analytics

- Google Analytics ekleyin
- PWA install tracking
- Error tracking (Sentry)

### 2. Performance Monitoring

- Lighthouse CI
- Web Vitals tracking
- Real User Monitoring (RUM)

### 3. Uptime Monitoring

- UptimeRobot
- Pingdom
- StatusCake

---

## 🎉 Başarılı Deployment!

Deployment tamamlandıktan sonra:

1. ✅ Production URL'i test edin
2. ✅ Farklı cihazlarda test edin
3. ✅ "Add to Home Screen" test edin
4. ✅ Offline mod test edin
5. ✅ API'lerin çalıştığını doğrulayın

**Sorularınız için**: GitHub Issues veya email

---

**Not**: Her deployment platformunun kendine özgü özellikleri vardır. Platform dokümantasyonunu kontrol edin.

