# Changelog - TypeTug Game

## Update: Pop-up "ROUND 1" & "FIGHT!" (11 Mei 2026)

### Perubahan
- ❌ **Dihapus**: Countdown 3-2-1 yang lama
- ✅ **Ditambahkan**: Pop-up "ROUND 1" (muncul 1 detik)
- ✅ **Ditambahkan**: Pop-up "FIGHT!" (muncul 1 detik setelah ROUND 1)
- ✅ **Ditambahkan**: Blur effect pada background gameplay saat pop-up muncul
- ✅ **Ditambahkan**: Animasi pop-in dan shimmer untuk efek dramatis

### Detail Implementasi

#### State Baru
```typescript
const [showRoundPopup, setShowRoundPopup] = useState(false);
const [showFightPopup, setShowFightPopup] = useState(false);
```

#### Alur Baru
1. User menekan SPASI atau game auto-start (multiplayer)
2. Pop-up "ROUND 1" muncul dengan:
   - Background blur (8px)
   - Border emas (#C08030)
   - Animasi pop-in dengan scale dan rotate
   - Durasi: 1 detik
3. Pop-up "FIGHT!" muncul dengan:
   - Background blur (8px)
   - Border merah-biru gradient
   - Text gradient merah ke biru
   - Durasi: 1 detik
4. Game langsung dimulai (fase "bermain")

#### Styling
- **ROUND 1**: 
  - Background: Gradient parchment (#F4EDE0 → #E8DFCC)
  - Border: 6px solid #C08030
  - Text: 48-72px, gold color dengan shadow
  - Decorative corners: 16x16px gold squares

- **FIGHT!**:
  - Background: Gradient red-blue (#FDE8E8 → #E8F4FD)
  - Border: 6px solid #C84040
  - Text: 56-96px, gradient merah ke biru
  - Decorative corners: Alternating red & blue

#### Animasi CSS
```css
@keyframes shimmer { 
  0%{opacity:0.8; transform:scale(0.95)} 
  50%{opacity:1; transform:scale(1.05)} 
  100%{opacity:1; transform:scale(1)} 
}

@keyframes popIn { 
  from{opacity:0; transform:scale(0.5) rotate(-5deg)} 
  to{opacity:1; transform:scale(1) rotate(0deg)} 
}
```

### File yang Dimodifikasi
- `src/app/pages/GamePage.tsx`
  - Menambah state `showRoundPopup` dan `showFightPopup`
  - Mengubah fungsi `mulaiPermainan()` untuk menggunakan setTimeout
  - Menambah 2 pop-up component dengan blur backdrop
  - Menambah blur effect pada main element

### Testing
- ✅ Pop-up muncul dengan timing yang tepat (1 detik masing-masing)
- ✅ Background blur berfungsi dengan baik
- ✅ Animasi smooth dan dramatis
- ✅ Game langsung mulai setelah "FIGHT!" hilang
- ✅ Tidak ada TypeScript errors

### Catatan
- Pop-up menggunakan `position: fixed` dengan `z-index: 200` untuk overlay penuh
- Backdrop blur menggunakan `backdropFilter` dan `WebkitBackdropFilter` untuk kompatibilitas
- Timing menggunakan `setTimeout` untuk kontrol yang presisi
- Main content mendapat blur effect saat pop-up aktif untuk fokus visual


---

## Update: Nama User di Pop-up Pemenang (11 Mei 2026)

### Perubahan
- ✅ **Pop-up JEDA**: Menampilkan nama user pemenang Round 1 (bukan "TIM MERAH/BIRU")
- ✅ **Pop-up HASIL PERTANDINGAN**: Menampilkan nama user di hasil per round
- ✅ **Pemenang Final**: Menampilkan nama user pemenang final dengan trophy emoji

### Detail Implementasi

#### Pop-up JEDA
**Sebelum:**
```
ROUND 1: TIM MERAH
```

**Sesudah:**
```
ROUND 1: FASHA  (jika user bernama Fasha menang)
ROUND 1: BOT    (jika lawan bot menang)
ROUND 1: BUDI   (jika lawan multiplayer bernama Budi menang)
```

#### Pop-up HASIL PERTANDINGAN

**Per Round:**
```
┌─────────────────────────────┐
│ ⚪1  ROUND 1  FASHA MENANG   │
└─────────────────────────────┘
┌─────────────────────────────┐
│ ⚪2  ROUND 2  BOT MENANG     │
└─────────────────────────────┘
```

**Pemenang Final:**
```
┌─────────────────────────┐
│   PEMENANG FINAL        │
│   🏆 FASHA 🏆           │
│        2 - 0            │
└─────────────────────────┘
```

### Logic

#### Menentukan Nama Pemenang
```typescript
const winnerName = 
  winner === "merah" ? namaPlayer.toUpperCase() : 
  winner === "biru" ? (isMultiplayer ? namaMusuh.toUpperCase() : "BOT") : 
  "SERI";
```

#### Mapping Tim ke User
- **Tim Merah** = User/Player (yang input nama di lobby)
- **Tim Biru** = Lawan (BOT atau nama user lawan di multiplayer)

### Contoh Skenario

#### Mode Bot
```
User: FASHA
Lawan: BOT

Hasil:
- Round 1: FASHA MENANG
- Round 2: BOT MENANG
- Final: FASHA (2-0) atau BOT (0-2) atau SERI (1-1)
```

#### Mode Multiplayer
```
User: FASHA
Lawan: BUDI

Hasil:
- Round 1: FASHA MENANG
- Round 2: BUDI MENANG
- Final: FASHA (2-0) atau BUDI (0-2) atau SERI (1-1)
```

### File yang Dimodifikasi
- `src/app/pages/GamePage.tsx`
  - Update pop-up JEDA untuk menampilkan nama user
  - Update pop-up HASIL PERTANDINGAN untuk menampilkan nama user per round
  - Update pemenang final untuk menampilkan nama user dengan trophy

### Testing
- ✅ Mode Bot: Nama user dan "BOT" muncul dengan benar
- ✅ Mode Multiplayer: Nama kedua user muncul dengan benar
- ✅ Pop-up JEDA menampilkan nama pemenang Round 1
- ✅ Pop-up HASIL menampilkan nama di setiap round
- ✅ Pemenang final menampilkan nama dengan trophy emoji
- ✅ Nama di-uppercase untuk konsistensi visual

### Visual Improvement
- Nama user lebih personal dan engaging
- Mudah diidentifikasi siapa yang menang
- Konsisten dengan nama yang ditampilkan di header (RED TEAM / BLUE TEAM)


---

## Bugfix: Rematch di Mode Bot (11 Mei 2026)

### Masalah
- Tombol "MAIN LAGI" tidak berfungsi di mode bot setelah game selesai
- Game tidak restart dengan benar karena state round tidak direset

### Penyebab
Fungsi `handleRematchClick()` tidak mereset state round (`currentRound`, `roundWins`, `showScorePopup`) sebelum memulai game baru.

### Solusi

#### Mode Bot
```typescript
const handleRematchClick = () => {
  if (!isMultiplayer) {
    // Reset round state
    setCurrentRound(1);
    setRoundWins([null, null]);
    setShowScorePopup(false);
    
    // Reset game data
    bersihkanData();
    
    // Mulai game baru
    mulaiPermainanRef.current();
  }
  // ... multiplayer logic
}
```

#### Mode Multiplayer
```typescript
socket.on("rematchAccepted", () => {
  // Reset round state
  setCurrentRound(1);
  setRoundWins([null, null]);
  setShowScorePopup(false);
  
  // Reset game
  resetPermainan();
  mulaiPermainanRef.current();
});
```

### State yang Direset
1. `currentRound` → 1 (kembali ke round 1)
2. `roundWins` → [null, null] (hapus hasil round sebelumnya)
3. `showScorePopup` → false (tutup pop-up score)
4. Semua state game lainnya via `bersihkanData()`

### Testing
- ✅ Mode Bot: Tombol "MAIN LAGI" berfungsi
- ✅ Mode Multiplayer: Rematch berfungsi dengan benar
- ✅ Round indicator kembali ke state awal (abu-abu)
- ✅ Game dimulai dari Round 1
- ✅ Pop-up score tertutup sebelum game baru dimulai

### File yang Dimodifikasi
- `src/app/pages/GamePage.tsx`
  - Update `handleRematchClick()` untuk reset round state
  - Update `socket.on("rematchAccepted")` untuk reset round state


---

## Update: Siapa Saja Bisa Mulai Game (11 Mei 2026)

### Masalah Sebelumnya
- Di multiplayer, kedua pemain harus pencet SPASI masing-masing
- Tim Merah pencet SPASI → game mulai untuk Tim Merah saja
- Tim Biru harus pencet SPASI juga → baru game mulai untuk Tim Biru
- Timer tidak sinkron karena mulai di waktu berbeda
- Aneh dan tidak intuitif

### Solusi Baru
- ✅ **Siapa saja yang pencet SPASI atau tombol MULAI pertama kali**, game langsung mulai untuk **KEDUA pemain**
- ✅ Host atau Challenger bisa mulai game
- ✅ Timer mulai bersamaan untuk kedua pemain
- ✅ Tidak perlu pencet SPASI masing-masing

### Implementasi

#### Client Side (GamePage.tsx)

**SPASI Handler:**
```typescript
useEffect(() => {
  if (fase !== "menunggu" && fase !== "selesai") return;
  const handler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (isMultiplayer) {
        // Siapa saja yang pencet, broadcast ke semua
        socket.emit("startGame", { roomCode: kodeRoom });
      } else {
        // Bot: langsung mulai
        mulaiPermainanRef.current();
      }
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [fase, isMultiplayer, kodeRoom]);
```

**Tombol MULAI:**
```typescript
<TombolRetro
  label="▶ MULAI"
  onClick={() => {
    if (fase === "menunggu" || fase === "selesai") {
      if (isMultiplayer) {
        // Siapa saja yang klik, broadcast ke semua
        socket.emit("startGame", { roomCode: kodeRoom });
      } else {
        mulaiPermainan();
      }
    }
  }}
  accent="#4A8858"
  disabled={fase === "hitung" || fase === "bermain"}
/>
```

**Listen Game Started:**
```typescript
socket.on("gameStarted", ({ startTime }) => {
  // Semua pemain mulai bersamaan
  mulaiPermainanRef.current();
});
```

#### Server Side (server.js)

**Sudah ada dari update sebelumnya:**
```javascript
socket.on("startGame", ({ roomCode }) => {
  const room = rooms[roomCode];
  if (room) {
    const startTime = Date.now();
    room.startTime = startTime;
    // Broadcast ke SEMUA pemain di room
    io.to(roomCode).emit("gameStarted", { startTime });
  }
});
```

### Alur Baru

#### Round 1
```
Kedua pemain di lobby
  ↓
Salah satu pemain pencet SPASI atau klik MULAI
  ↓
Client → Server: "startGame"
  ↓
Server → KEDUA pemain: "gameStarted"
  ↓
KEDUA pemain mulai bersamaan ✅
  ↓
Timer sinkron ✅
```

#### Round 2 (Setelah Jeda)
```
Round 1 selesai
  ↓
Pop-up JEDA (3 detik)
  ↓
Fase = "jeda"
  ↓
Salah satu pemain pencet SPASI atau klik MULAI
  ↓
Client → Server: "startGame"
  ↓
Server → KEDUA pemain: "gameStarted"
  ↓
KEDUA pemain mulai Round 2 bersamaan ✅
```

#### Rematch
```
Game selesai
  ↓
Pop-up HASIL PERTANDINGAN
  ↓
Salah satu pemain klik MAIN LAGI
  ↓
Kedua pemain reset state
  ↓
Fase = "menunggu"
  ↓
Salah satu pemain pencet SPASI atau klik MULAI
  ↓
KEDUA pemain mulai dari Round 1 bersamaan ✅
```

### Mode Bot
- **Round 1**: User pencet SPASI → langsung mulai
- **Round 2**: Auto-start setelah jeda 3 detik (tidak perlu pencet SPASI)
- **Rematch**: User pencet SPASI → langsung mulai

### Keuntungan

1. **Intuitif**: Siapa saja bisa mulai, tidak perlu koordinasi
2. **Sinkron**: Timer mulai bersamaan untuk kedua pemain
3. **Fleksibel**: Host atau Challenger bisa mulai
4. **Tidak Aneh**: Tidak perlu pencet SPASI masing-masing
5. **User Friendly**: Seperti game multiplayer pada umumnya

### Testing

- ✅ Host pencet SPASI → kedua pemain mulai
- ✅ Challenger pencet SPASI → kedua pemain mulai
- ✅ Host klik MULAI → kedua pemain mulai
- ✅ Challenger klik MULAI → kedua pemain mulai
- ✅ Timer sinkron di kedua tab
- ✅ Round 2: siapa saja bisa mulai
- ✅ Rematch: siapa saja bisa mulai
- ✅ Mode bot: tetap berfungsi normal

### File yang Dimodifikasi
- `src/app/pages/GamePage.tsx`
  - Update SPASI handler untuk broadcast di multiplayer
  - Update tombol MULAI untuk broadcast di multiplayer
  - Remove auto-start dari roomReady
  - Remove auto-start dari rematchAccepted
  - Mode bot: auto-start Round 2 setelah jeda


---

## Bugfix: Round 2 Tidak Mulai Setelah Jeda (11 Mei 2026)

### Masalah
- Setelah Round 1 selesai, muncul pop-up JEDA
- Setelah jeda 3 detik, game tidak lanjut ke Round 2
- Stuck di fase "jeda"
- Tidak ada instruksi untuk user

### Penyebab
1. SPASI handler tidak mendengarkan fase "jeda"
2. Tombol MULAI tidak bisa diklik saat fase "jeda"
3. Mode bot tidak auto-start Round 2 setelah jeda
4. Tidak ada instruksi visual untuk user

### Solusi

#### 1. Update SPASI Handler
**Sebelum:**
```typescript
if (fase !== "menunggu" && fase !== "selesai") return;
```

**Sesudah:**
```typescript
if (fase !== "menunggu" && fase !== "selesai" && fase !== "jeda") return;
```

Sekarang SPASI bisa digunakan saat fase "jeda" untuk mulai Round 2.

#### 2. Update Tombol MULAI
**Sebelum:**
```typescript
if (fase === "menunggu" || fase === "selesai") {
  // ...
}
```

**Sesudah:**
```typescript
if (fase === "menunggu" || fase === "selesai" || fase === "jeda") {
  // ...
}
```

Sekarang tombol MULAI bisa diklik saat fase "jeda".

#### 3. Tambah Instruksi di Pop-up JEDA
```typescript
{isMultiplayer && (
  <div style={{
    fontSize: "clamp(10px, 2vw, 12px)",
    color: "#C08030",
    animation: "blinkPulse 1.5s ease infinite",
  }}>
    [ TEKAN SPASI UNTUK MULAI ]
  </div>
)}
```

Instruksi berkedip untuk memberi tahu user bahwa mereka bisa mulai Round 2.

#### 4. Mode Bot Tetap Auto-Start
```typescript
if (currentRound === 1) {
  setTimeout(() => {
    setCurrentRound(2);
    if (!isMultiplayer) {
      // Mode bot: auto-start Round 2
      mulaiPermainanRef.current();
    }
  }, 3000);
  return "jeda";
}
```

Mode bot tetap auto-start setelah jeda 3 detik.

### Alur Baru

#### Mode Multiplayer
```
Round 1 selesai
  ↓
Pop-up JEDA muncul (3 detik)
  ↓
Fase = "jeda"
  ↓
Instruksi: "[ TEKAN SPASI UNTUK MULAI ]" (berkedip)
  ↓
Salah satu pemain:
  - Pencet SPASI, atau
  - Klik tombol "▶ MULAI"
  ↓
Client → Server: "startGame"
  ↓
Server → KEDUA pemain: "gameStarted"
  ↓
Pop-up "ROUND 2" (1s)
  ↓
Pop-up "FIGHT!" (1s)
  ↓
Round 2 mulai ✅
```

#### Mode Bot
```
Round 1 selesai
  ↓
Pop-up JEDA muncul (3 detik)
  ↓
Fase = "jeda"
  ↓
Setelah 3 detik: AUTO-START ✅
  ↓
Pop-up "ROUND 2" (1s)
  ↓
Pop-up "FIGHT!" (1s)
  ↓
Round 2 mulai ✅
```

### Visual Update

**Pop-up JEDA (Multiplayer):**
```
┌─────────────────────────────────┐
│  ROUND 1: FASHA                 │
│  ─────────────────────          │
│  BERSIAP UNTUK ROUND 2...       │
│                                 │
│  [ TEKAN SPASI UNTUK MULAI ]    │ ← Berkedip
└─────────────────────────────────┘
```

**Pop-up JEDA (Bot):**
```
┌─────────────────────────────────┐
│  ROUND 1: FASHA                 │
│  ─────────────────────          │
│  BERSIAP UNTUK ROUND 2...       │
│                                 │
│  (Auto-start setelah 3 detik)   │
└─────────────────────────────────┘
```

### Testing
- ✅ Mode Bot: Round 2 auto-start setelah jeda 3 detik
- ✅ Mode Multiplayer: SPASI bisa digunakan saat jeda
- ✅ Mode Multiplayer: Tombol MULAI bisa diklik saat jeda
- ✅ Mode Multiplayer: Instruksi berkedip terlihat jelas
- ✅ Kedua pemain mulai Round 2 bersamaan
- ✅ Timer sinkron di Round 2

### File yang Dimodifikasi
- `src/app/pages/GamePage.tsx`
  - Update SPASI handler untuk mendengarkan fase "jeda"
  - Update tombol MULAI untuk bisa diklik saat fase "jeda"
  - Tambah instruksi berkedip di pop-up JEDA (multiplayer)
  - Mode bot tetap auto-start setelah jeda 3 detik
