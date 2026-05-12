# 🔐 Setup Google OAuth untuk TypeTug

Panduan lengkap untuk mengaktifkan fitur "Masuk dengan Google" di aplikasi TypeTug.

## 📋 Langkah-langkah Setup

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **"Select a project"** → **"New Project"**
3. Beri nama project: `TypeTug` (atau nama lain)
4. Klik **"Create"**

### 2. Aktifkan Google Identity Services

1. Di dashboard project, buka menu **"APIs & Services"** → **"Library"**
2. Cari **"Google Identity Services"** atau **"Google+ API"**
3. Klik **"Enable"**

### 3. Konfigurasi OAuth Consent Screen

1. Buka **"APIs & Services"** → **"OAuth consent screen"**
2. Pilih **"External"** (untuk testing) atau **"Internal"** (jika punya Google Workspace)
3. Klik **"Create"**
4. Isi informasi aplikasi:
   - **App name**: `TypeTug`
   - **User support email**: Email Anda
   - **Developer contact email**: Email Anda
5. Klik **"Save and Continue"**
6. Di bagian **Scopes**, klik **"Add or Remove Scopes"**
7. Pilih scope berikut:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Klik **"Save and Continue"**
9. Di bagian **Test users** (jika External), tambahkan email untuk testing
10. Klik **"Save and Continue"**

### 4. Buat OAuth 2.0 Client ID

1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik **"+ Create Credentials"** → **"OAuth client ID"**
3. Pilih **Application type**: `Web application`
4. Beri nama: `TypeTug Web Client`
5. Di **Authorized JavaScript origins**, tambahkan:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
6. Di **Authorized redirect URIs**, tambahkan:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
7. Klik **"Create"**
8. **PENTING**: Copy **Client ID** yang muncul (format: `xxxxx.apps.googleusercontent.com`)

### 5. Konfigurasi Environment Variable

1. Buka file `.env` di root project
2. Uncomment dan isi `VITE_GOOGLE_CLIENT_ID`:
   ```env
   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```
3. Save file

### 6. Restart Development Server

```bash
# Stop server yang sedang berjalan (Ctrl+C)
# Kemudian jalankan ulang:
npm run dev
```

### 7. Test Login dengan Google

1. Buka browser: `http://localhost:5174`
2. Klik tombol **"MASUK DENGAN GOOGLE"**
3. Pilih akun Google Anda
4. Berikan izin akses
5. Anda akan otomatis login dan redirect ke halaman Start

## 🚀 Setup untuk Production

Ketika deploy ke production, tambahkan domain production Anda:

### Di Google Cloud Console:

1. Buka **Credentials** → Edit OAuth Client
2. Tambahkan di **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
3. Tambahkan di **Authorized redirect URIs**:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

### Di Environment Variables (Vercel/Netlify):

```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

## 🔒 Keamanan

- ✅ Client ID bersifat **public** dan aman untuk di-commit ke repository
- ✅ Jangan pernah commit **Client Secret** (tidak digunakan di aplikasi ini)
- ✅ Validasi token dilakukan di backend menggunakan Google's public keys
- ✅ User data disimpan dengan aman di database SQLite

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solusi**: Pastikan URL di browser sama persis dengan yang didaftarkan di Google Console (termasuk port)

### Error: "popup_closed_by_user"
**Solusi**: User menutup popup Google. Minta user untuk coba lagi.

### Tombol Google tidak muncul
**Solusi**: 
1. Periksa apakah `VITE_GOOGLE_CLIENT_ID` sudah diisi di `.env`
2. Restart development server
3. Clear browser cache

### Error: "invalid_client"
**Solusi**: Client ID salah atau tidak valid. Periksa kembali Client ID di `.env`

## 📚 Referensi

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Checklist Setup

- [ ] Project dibuat di Google Cloud Console
- [ ] OAuth Consent Screen dikonfigurasi
- [ ] OAuth Client ID dibuat
- [ ] Authorized origins ditambahkan
- [ ] Client ID disalin ke `.env`
- [ ] Development server di-restart
- [ ] Login Google berhasil di-test

---

**Selamat! 🎉** Fitur "Masuk dengan Google" sudah aktif di TypeTug!
