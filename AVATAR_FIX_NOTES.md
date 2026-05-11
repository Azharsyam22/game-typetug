# 🖼️ Avatar System - Fix Notes

## ✅ Masalah yang Diperbaiki

### Masalah Awal:
- Avatar Google tidak muncul, hanya menampilkan icon placeholder
- User yang login dengan email/password tidak punya avatar
- Tidak ada fallback jika avatar gagal dimuat

### Solusi yang Diterapkan:

#### 1. **Backend - Google OAuth Avatar Update**
- ✅ Mengubah query UPDATE agar selalu update `avatar_url` terbaru dari Google
- ✅ Sebelumnya: `COALESCE(?, avatar_url)` (mempertahankan avatar lama)
- ✅ Sekarang: Langsung update dengan `avatar_url = ?` (selalu ambil yang terbaru)

**File**: `server.js` (line ~235)
```javascript
// Update google_id dan avatar_url dari Google (selalu update avatar terbaru)
db.prepare("UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = ? WHERE id = ?")
  .run(googleId, profile.picture || null, user.id);
```

#### 2. **Backend - Default Avatar untuk Email/Password Registration**
- ✅ User baru yang register dengan email/password otomatis dapat default avatar
- ✅ Menggunakan UI Avatars API dengan initial username
- ✅ Warna sesuai tema TypeTug (background: #C08030)

**File**: `server.js` (line ~180)
```javascript
const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedUsername)}&background=C08030&color=fff&size=96`;
```

#### 3. **Frontend - Avatar Fallback System**
- ✅ Menampilkan avatar jika `avatarUrl` ada
- ✅ Fallback ke UI Avatars jika gambar gagal dimuat (onError)
- ✅ Fallback ke initial letter jika tidak ada `avatarUrl`

**File**: `StartPage.tsx` (line ~62)
```tsx
{user?.avatarUrl ? (
  <img
    src={user.avatarUrl}
    onError={(e) => {
      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=C08030&color=fff&size=96`;
    }}
    style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
  />
) : (
  <div style={{ /* Initial letter fallback */ }}>
    {(user?.username || "U").charAt(0).toUpperCase()}
  </div>
)}
```

#### 4. **Database Fix Script**
- ✅ Script `fix-avatar.js` untuk update user lama yang belum punya avatar
- ✅ Script `check-db.js` untuk memeriksa data user di database

---

## 🎨 Avatar Priority System

1. **Google Avatar** (jika login dengan Google)
   - URL dari Google: `https://lh3.googleusercontent.com/...`
   
2. **UI Avatars** (jika login dengan email/password atau fallback)
   - URL: `https://ui-avatars.com/api/?name=Username&background=C08030&color=fff&size=96`
   
3. **Initial Letter** (fallback terakhir)
   - Huruf pertama username dalam circle dengan background #C08030

---

## 🔧 Cara Menggunakan

### Untuk User yang Sudah Login:
1. **Logout** dari aplikasi
2. **Login ulang** (dengan Google atau email/password)
3. Avatar akan muncul dengan benar

### Untuk User Baru:
- ✅ Login dengan Google → Avatar Google otomatis muncul
- ✅ Register dengan email/password → Default avatar dengan initial username

---

## 🧪 Testing

### Test Google Avatar:
1. Login dengan akun Google
2. Verifikasi avatar Google muncul di pojok kanan atas
3. Logout dan login ulang untuk memastikan avatar tetap muncul

### Test Email/Password Avatar:
1. Register akun baru dengan email/password
2. Verifikasi default avatar dengan initial username muncul
3. Avatar harus memiliki background warna #C08030 (emas TypeTug)

### Test Fallback:
1. Buka Developer Tools → Network
2. Block request ke domain avatar
3. Verifikasi fallback avatar muncul (UI Avatars atau initial letter)

---

## 📊 Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT,
  avatar_url TEXT,  -- ← Avatar URL disimpan di sini
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 🛠️ Maintenance Scripts

### Check Database:
```bash
node check-db.js
```

### Fix Missing Avatars:
```bash
node fix-avatar.js
```

---

## ✅ Checklist

- [x] Backend: Update avatar_url dari Google
- [x] Backend: Default avatar untuk email/password registration
- [x] Frontend: Avatar fallback system
- [x] Database: Fix existing users without avatar
- [x] Testing: Google OAuth avatar
- [x] Testing: Email/password avatar
- [x] Testing: Fallback system

---

**Status**: ✅ **FIXED**  
**Last Updated**: 11 Mei 2026
