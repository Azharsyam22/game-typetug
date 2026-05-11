# ✅ Google Cloud Console Checklist

## 🔧 Konfigurasi yang Harus Dilakukan di Google Cloud Console

### 1. Authorized JavaScript Origins

Pastikan origins berikut sudah ditambahkan di Google Cloud Console:

**Path**: APIs & Services → Credentials → OAuth 2.0 Client IDs → Edit

**Authorized JavaScript origins**:
```
http://localhost:5173
http://localhost:5174
http://localhost:5175
```

### 2. Authorized Redirect URIs (Opsional untuk OAuth 2.0)

Untuk Google Identity Services (yang kita gunakan), redirect URIs **tidak diperlukan**.

Tapi jika diminta, tambahkan:
```
http://localhost:5173
http://localhost:5174
http://localhost:5175
```

### 3. OAuth Consent Screen

Pastikan sudah dikonfigurasi:

- [x] **App name**: TypeTug (atau nama lain)
- [x] **User support email**: Email Anda
- [x] **Developer contact email**: Email Anda
- [x] **Scopes**: 
  - `userinfo.email`
  - `userinfo.profile`
  - `openid`

### 4. Test Users (Jika App Status = Testing)

Jika OAuth Consent Screen masih dalam mode **Testing**, tambahkan email yang akan digunakan untuk testing:

- Email 1: _________________
- Email 2: _________________

**Note**: Dalam mode Testing, hanya email yang terdaftar yang bisa login.

### 5. Verifikasi Client ID

**Client ID yang digunakan**:
```
96451660128-ne4aoobscmvokceiqsb3appsgppnseou.apps.googleusercontent.com
```

Pastikan Client ID ini **aktif** dan **tidak disabled** di Google Console.

---

## 🚀 Cara Mengecek di Google Console

1. Buka: https://console.cloud.google.com/
2. Pilih project Anda
3. Buka **APIs & Services** → **Credentials**
4. Cari Client ID: `96451660128-ne4aoobscmvokceiqsb3appsgppnseou`
5. Klik **Edit** (icon pensil)
6. Verifikasi **Authorized JavaScript origins** sudah benar
7. Klik **Save**

---

## ⚠️ Common Issues

### Issue: "redirect_uri_mismatch"
**Penyebab**: URL di browser tidak terdaftar di Authorized Origins  
**Solusi**: Tambahkan URL yang digunakan ke Authorized JavaScript origins

### Issue: "access_denied"
**Penyebab**: App masih dalam mode Testing dan email tidak terdaftar  
**Solusi**: Tambahkan email ke Test Users atau publish app

### Issue: "invalid_client"
**Penyebab**: Client ID salah atau tidak aktif  
**Solusi**: Periksa Client ID di `.env` dan Google Console

---

## 📝 Quick Commands

### Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Check Environment Variable
```bash
# Windows PowerShell
echo $env:VITE_GOOGLE_CLIENT_ID

# Windows CMD
echo %VITE_GOOGLE_CLIENT_ID%
```

### Test API Endpoint
```bash
curl http://localhost:3001/api/auth/google -X POST -H "Content-Type: application/json" -d "{\"credential\":\"test\"}"
```

---

**Last Updated**: 11 Mei 2026
