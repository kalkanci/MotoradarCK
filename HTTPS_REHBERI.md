# HTTPS Kurulum Rehberi - MotoNavigator PWA

PWA özelliklerinin çalışması için HTTPS gereklidir. Bu rehber, local development için HTTPS kurulumunu açıklar.

## 🚨 Neden HTTPS Gerekli?

- **Service Worker**: Sadece HTTPS üzerinde çalışır (localhost hariç)
- **Geolocation API**: Bazı tarayıcılarda HTTPS gerektirir
- **Push Notifications**: HTTPS zorunlu
- **Add to Home Screen**: Güvenlik için HTTPS tercih edilir

## 🔧 Local Development için HTTPS

### Yöntem 1: mkcert (Önerilen - En Kolay)

**Windows için:**

1. **mkcert'i indirin:**
   ```powershell
   # Chocolatey ile
   choco install mkcert
   
   # veya manuel: https://github.com/FiloSottile/mkcert/releases
   ```

2. **Local CA oluşturun:**
   ```powershell
   image.png
   ```

3. **Sertifika oluşturun:**
   ```powershell
   cd "Moto PWA"
   mkcert localhost 127.0.0.1 ::1 192.168.1.106
   ```
   (192.168.1.106 yerine kendi local IP'nizi yazın)

4. **Sertifikalar oluşturuldu:**
   - `localhost+3.pem` (sertifika)
   - `localhost+3-key.pem` (private key)

5. **HTTPS sunucusu başlatın:**
   ```powershell
   # Node.js ile
   npx http-server . -p 8080 -S -C localhost+3.pem -K localhost+3-key.pem
   ```

### Yöntem 2: Node.js HTTPS Server

1. **package.json'a script ekleyin:**
   ```json
   {
     "scripts": {
       "dev:https": "node https-server.js"
     }
   }
   ```

2. **https-server.js dosyası oluşturun:**
   ```javascript
   const https = require('https');
   const fs = require('fs');
   const path = require('path');
   const { execSync } = require('child_process');

   // mkcert ile sertifika oluştur (eğer yoksa)
   const certPath = path.join(__dirname, 'localhost+3.pem');
   const keyPath = path.join(__dirname, 'localhost+3-key.pem');

   if (!fs.existsSync(certPath)) {
     console.log('Sertifika bulunamadı. mkcert ile oluşturuluyor...');
     try {
       execSync(`mkcert localhost 127.0.0.1 ::1`, { cwd: __dirname });
     } catch (error) {
       console.error('mkcert bulunamadı. Lütfen mkcert kurun: https://github.com/FiloSottile/mkcert');
       process.exit(1);
     }
   }

   const options = {
     key: fs.readFileSync(keyPath),
     cert: fs.readFileSync(certPath)
   };

   const express = require('express');
   const app = express();
   app.use(express.static(__dirname));

   https.createServer(options, app).listen(8080, () => {
     console.log('HTTPS sunucu çalışıyor: https://localhost:8080');
     console.log('⚠️  Tarayıcıda "Güvenli değil" uyarısı görünebilir - mkcert sertifikasını kabul edin');
   });
   ```

3. **Bağımlılıkları yükleyin:**
   ```bash
   npm install express
   ```

4. **HTTPS sunucusunu başlatın:**
   ```bash
   npm run dev:https
   ```

### Yöntem 3: ngrok (Hızlı Test)

1. **ngrok'u indirin:**
   - https://ngrok.com/download

2. **HTTP sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. **ngrok tüneli oluşturun:**
   ```bash
   ngrok http 8080
   ```

4. **ngrok'un verdiği HTTPS URL'ini kullanın:**
   - Örnek: `https://abc123.ngrok.io`

**Not**: ngrok ücretsiz tier'da URL her başlatmada değişir.

## 🔐 Production için HTTPS

### Let's Encrypt (Ücretsiz)

1. **Certbot kurulumu:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Sertifika al:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Otomatik yenileme:**
   ```bash
   sudo certbot renew --dry-run
   ```

Detaylı rehber için: `DEPLOYMENT.md`

## ✅ HTTPS Kontrolü

HTTPS çalışıyorsa:
- ✅ Adres çubuğunda kilit ikonu görünür
- ✅ "Güvenli değil" uyarısı kaybolur
- ✅ Service Worker kaydedilir
- ✅ Geolocation API çalışır

## 🐛 Sorun Giderme

### "Güvenli değil" Uyarısı

**Çözüm:**
1. mkcert sertifikasını tarayıcıya güven
2. Chrome: Sertifika detayları > Güven > Güvenilir olarak işaretle
3. Firefox: Sertifika ayarlarından güven

### Service Worker Kaydedilmiyor

**Neden:** HTTPS yok veya sertifika güvenilmiyor

**Çözüm:**
1. HTTPS kullanın
2. Sertifikayı tarayıcıya güven
3. Console'da hataları kontrol edin

### Geolocation Çalışmıyor

**Neden:** Bazı tarayıcılar HTTP'de geolocation'ı engeller

**Çözüm:**
1. HTTPS kullanın
2. Tarayıcı ayarlarından konum iznini kontrol edin

## 📝 Hızlı Başlangıç

**En kolay yöntem (mkcert):**

```powershell
# 1. mkcert kur
choco install mkcert

# 2. CA oluştur
mkcert -install

# 3. Sertifika oluştur
cd "Moto PWA"
mkcert localhost 127.0.0.1 ::1

# 4. HTTPS sunucu başlat
npx http-server . -p 8080 -S -C localhost+3.pem -K localhost+3-key.pem
```

**Tarayıcıda aç:**
```
https://localhost:8080
```

---

**Not**: Local development için mkcert en pratik çözümdür. Production'da Let's Encrypt kullanın.

