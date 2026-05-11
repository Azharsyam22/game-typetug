# 🚀 Panduan Deployment TypeTug

Panduan lengkap untuk deploy TypeTug ke production.

## 📋 Checklist Sebelum Deploy

- [ ] Build berhasil tanpa error (`npm run build`)
- [ ] Test di local environment
- [ ] Siapkan domain (opsional)
- [ ] Siapkan akun hosting

## 🌐 Deployment Frontend (Vercel)

### 1. Persiapan
```bash
npm run build
```

### 2. Deploy ke Vercel

#### Via Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel --prod
```

#### Via Vercel Dashboard:
1. Login ke [vercel.com](https://vercel.com)
2. Import repository GitHub
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm install`

### 3. Environment Variables (Vercel)
Tambahkan di Vercel Dashboard → Settings → Environment Variables:
```
VITE_SOCKET_URL=https://your-backend-url.com
```

## 🖥️ Deployment Backend (Railway)

### 1. Persiapan
Pastikan `server.js` sudah siap.

### 2. Deploy ke Railway

1. Login ke [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select repository
4. Railway akan auto-detect Node.js

### 3. Environment Variables (Railway)
Tambahkan di Railway Dashboard → Variables:
```
PORT=3001
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://www.your-frontend-domain.vercel.app
NODE_ENV=production
```

### 4. Start Command
Railway akan otomatis menggunakan `npm start` dari package.json

## 🔄 Alternative: Deploy Backend ke Render

### 1. Setup
1. Login ke [render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Build Command: `npm install`
5. Start Command: `npm start`

### 2. Environment Variables
```
PORT=3001
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

## 🔗 Menghubungkan Frontend & Backend

### 1. Dapatkan URL Backend
Setelah deploy backend, copy URL (contoh: `https://typetug-api.railway.app`)

### 2. Update Frontend Environment
Di Vercel, set:
```
VITE_SOCKET_URL=https://typetug-api.railway.app
```

### 3. Update Backend CORS
Di Railway/Render, set:
```
ALLOWED_ORIGINS=https://typetug.vercel.app,https://www.typetug.vercel.app
```

### 4. Redeploy
- Redeploy frontend di Vercel
- Backend akan auto-restart dengan env baru

## ✅ Testing Production

1. Buka frontend URL
2. Test mode bot terlebih dahulu
3. Test mode multiplayer:
   - Buka 2 tab/browser berbeda
   - Buat room di tab 1
   - Join room di tab 2
   - Test gameplay

## 🐛 Troubleshooting

### Frontend tidak bisa connect ke backend
- ✅ Cek VITE_SOCKET_URL sudah benar
- ✅ Cek backend sudah running
- ✅ Cek CORS di backend sudah include frontend URL

### WebSocket connection failed
- ✅ Pastikan backend support WebSocket (Railway & Render support)
- ✅ Cek firewall/security settings
- ✅ Cek browser console untuk error detail

### Build error di Vercel
- ✅ Cek Node.js version compatibility
- ✅ Pastikan semua dependencies ada di package.json
- ✅ Cek build logs untuk error spesifik

## 📊 Monitoring

### Railway
- Dashboard → Metrics untuk CPU/Memory usage
- Logs untuk debugging

### Vercel
- Analytics untuk traffic
- Logs untuk build & runtime errors

## 💰 Estimasi Biaya

### Free Tier:
- **Vercel**: 100GB bandwidth/bulan (cukup untuk ribuan users)
- **Railway**: $5 credit/bulan (cukup untuk testing & small traffic)
- **Render**: 750 jam/bulan free tier

### Recommended untuk Production:
- **Vercel Pro**: $20/bulan (unlimited bandwidth)
- **Railway**: Pay as you go (~$5-20/bulan tergantung traffic)

## 🔒 Security Checklist

- [x] CORS configured dengan whitelist
- [x] Environment variables untuk sensitive data
- [x] HTTPS enabled (otomatis di Vercel/Railway)
- [ ] Rate limiting (tambahkan jika traffic tinggi)
- [ ] Input sanitization (sudah ada basic validation)

## 📈 Optimasi Performance

1. **CDN**: Vercel otomatis menggunakan CDN global
2. **Compression**: Gzip enabled by default
3. **Caching**: Static assets di-cache otomatis
4. **WebSocket**: Persistent connection untuk real-time

## 🎯 Next Steps

1. Setup custom domain (opsional)
2. Setup monitoring/analytics
3. Implement rate limiting untuk production
4. Add error tracking (Sentry, LogRocket)
5. Setup CI/CD untuk auto-deploy

---

**Good luck with your deployment! 🚀**
