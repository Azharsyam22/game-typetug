# 🔧 Troubleshooting

## Masalah Umum dan Solusi

### 1. "Failed to fetch" saat Login/Register

**Penyebab**: Backend server belum berjalan atau port salah

**Solusi**:
```bash
# Pastikan backend berjalan di terminal terpisah
npm start

# Periksa apakah berjalan di port 3001
# Output: "Socket.IO Server is running on port 3001"
```

---

### 2. Avatar Google Tidak Muncul

**Penyebab**: User perlu logout dan login ulang setelah setup

**Solusi**:
1. Klik tombol "LOGOUT" di pojok kanan atas
2. Login ulang dengan Google
3. Avatar akan muncul dengan benar

---

### 3. Tombol Google OAuth Disabled

**Penyebab**: `VITE_GOOGLE_CLIENT_ID` belum diisi di `.env`

**Solusi**:
1. Buka file `.env`
2. Tambahkan: `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
3. Restart dev server: `npm run dev`
4. Lihat [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) untuk panduan lengkap

---

### 4. "redirect_uri_mismatch" Error (Google OAuth)

**Penyebab**: URL tidak terdaftar di Google Console

**Solusi**:
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Buka **APIs & Services** → **Credentials**
4. Edit OAuth Client ID
5. Tambahkan di **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:5174`
6. Klik **Save**

---

### 5. Port 3001 atau 5173 Sudah Digunakan

**Penyebab**: Ada process lain yang menggunakan port tersebut

**Solusi Windows**:
```bash
# Cari process yang menggunakan port
netstat -ano | findstr :3001

# Kill process (ganti PID dengan nomor yang muncul)
taskkill /F /PID [PID]
```

**Solusi Linux/Mac**:
```bash
# Cari dan kill process
lsof -ti:3001 | xargs kill -9
```

---

### 6. Dependencies Error saat Install

**Penyebab**: Node modules corrupt atau versi Node.js tidak kompatibel

**Solusi**:
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install

# Atau gunakan npm cache clean
npm cache clean --force
npm install
```

---

### 7. WebSocket Connection Failed

**Penyebab**: CORS atau URL socket salah

**Solusi**:
1. Periksa `.env`:
   ```env
   VITE_SOCKET_URL=http://localhost:3001
   VITE_API_URL=http://localhost:3001
   ```
2. Pastikan backend berjalan
3. Periksa CORS di `server.js`:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
   ```

---

### 8. Build Error di Production

**Penyebab**: Environment variables tidak diset

**Solusi Vercel/Netlify**:
1. Buka dashboard project
2. Settings → Environment Variables
3. Tambahkan:
   - `VITE_SOCKET_URL=https://your-backend-url.com`
   - `VITE_API_URL=https://your-backend-url.com`
   - `VITE_GOOGLE_CLIENT_ID=your-client-id` (opsional)

---

### 9. Game Lag atau Tidak Sinkron

**Penyebab**: Koneksi internet lambat atau server overload

**Solusi**:
1. Periksa koneksi internet
2. Refresh halaman (F5)
3. Restart kedua server (backend & frontend)
4. Gunakan browser modern (Chrome, Firefox, Edge)

---

### 10. Database Error

**Penyebab**: File `typetug.db` corrupt atau permission error

**Solusi**:
```bash
# Backup database lama (jika ada data penting)
cp typetug.db typetug.db.backup

# Hapus database (akan dibuat ulang otomatis)
rm typetug.db

# Restart backend server
npm start
```

---

## 📞 Butuh Bantuan Lebih Lanjut?

- **GitHub Issues**: [github.com/Azharsyam22/game-typetug/issues](https://github.com/Azharsyam22/game-typetug/issues)
- **Email**: azharsyam22@gmail.com

---

**Last Updated**: 11 Mei 2026
