# 🚀 Cara Mengaktifkan Google OAuth (Quick Guide)

## Langkah Cepat

### 1. Dapatkan Google Client ID
1. Buka: https://console.cloud.google.com/
2. Buat project baru atau pilih project yang ada
3. Buka **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth client ID**
5. Pilih **Web application**
6. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:5174`
7. Copy **Client ID** yang dihasilkan

### 2. Tambahkan ke File .env
```env
VITE_GOOGLE_CLIENT_ID=xxxxx-xxxxxx.apps.googleusercontent.com
```

### 3. Restart Server
```bash
# Stop server (Ctrl+C di terminal)
# Jalankan ulang:
npm run dev
```

### 4. Test!
- Buka http://localhost:5174
- Tombol "MASUK DENGAN GOOGLE" sekarang aktif
- Klik dan login dengan akun Google Anda

## 📖 Panduan Lengkap
Lihat [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) untuk panduan detail.

## ⚠️ Catatan Penting
- Tanpa Client ID, tombol Google akan muncul tapi **disabled** (tidak bisa diklik)
- Client ID aman untuk di-commit ke repository (bersifat public)
- Untuk production, tambahkan domain production Anda di Google Console
