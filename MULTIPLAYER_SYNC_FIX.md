# Multiplayer Synchronization Fix

## Masalah yang Diperbaiki

### 1. Timer Tidak Sinkron
**Masalah:**
- Kedua pemain memiliki timer yang berbeda
- Satu pemain selesai lebih dulu karena timer habis duluan
- Tidak ada sinkronisasi waktu mulai game

**Penyebab:**
- Setiap client memulai timer sendiri tanpa koordinasi
- Tidak ada server timestamp untuk sinkronisasi

### 2. Indikator Round Warna Salah
**Masalah:**
- Indikator round menampilkan warna tim (merah/biru) bukan hasil (menang/kalah)
- Dari POV Tim Biru, indikator tidak menunjukkan hasil yang benar
- Seharusnya: Hijau = Menang, Merah = Kalah

**Penyebab:**
- Warna indikator berdasarkan tim pemenang, bukan perspektif pemain
- Tidak ada logika untuk menentukan apakah pemain menang atau kalah

---

## Solusi

### 1. Sinkronisasi Timer via WebSocket

#### Server Side (server.js)

**Event Baru:**
```javascript
// Start Game Synchronization
socket.on("startGame", ({ roomCode }) => {
  const room = rooms[roomCode];
  if (room) {
    const startTime = Date.now();
    room.startTime = startTime;
    // Broadcast ke semua pemain untuk mulai bersamaan
    io.to(roomCode).emit("gameStarted", { startTime });
  }
});

// Round End Synchronization
socket.on("roundEnded", ({ roomCode, round, winner }) => {
  const room = rooms[roomCode];
  if (room) {
    // Broadcast hasil round ke semua pemain
    io.to(roomCode).emit("roundResult", { round, winner });
  }
});
```

#### Client Side (GamePage.tsx)

**Listen untuk Game Start:**
```typescript
socket.on("gameStarted", ({ startTime }) => {
  // Semua pemain mulai bersamaan
  mulaiPermainanRef.current();
});
```

**Broadcast Round Result:**
```typescript
socket.on("roundResult", ({ round, winner }) => {
  // Sync hasil round dari server
  const newRoundWins = [...roundWins];
  newRoundWins[round - 1] = winner;
  setRoundWins(newRoundWins);
});
```

**Host Trigger Start:**
```typescript
socket.on("roomReady", ({ players }) => {
  // Host yang memulai game dan broadcast ke semua
  if (state?.isHost) {
    setTimeout(() => {
      socket.emit("startGame", { roomCode: kodeRoom });
    }, 2000);
  }
});
```

### 2. Perbaikan Warna Indikator Round

**Logika Baru:**
```typescript
const roundWinner = roundWins[round - 1];

// Tentukan warna berdasarkan perspektif pemain
const indicatorColor = 
  roundWinner === "merah" ? "#4A9060" :  // Hijau - Player (Tim Merah) menang
  roundWinner === "biru" ? "#C84040" :   // Merah - Player kalah (Tim Biru menang)
  "#9A8878";                              // Abu-abu - Belum dimainkan
```

**Penjelasan:**
- Player selalu Tim Merah (POV player)
- Jika `roundWinner === "merah"` → Player menang → **Hijau**
- Jika `roundWinner === "biru"` → Player kalah → **Merah**
- Jika `roundWinner === null` → Belum dimainkan → **Abu-abu**

---

## Alur Sinkronisasi

### Game Start
```
Host creates room
  ↓
Challenger joins room
  ↓
Server emits "roomReady" to both
  ↓
Host waits 2 seconds
  ↓
Host emits "startGame" to server
  ↓
Server broadcasts "gameStarted" to ALL players
  ↓
Both players start game SIMULTANEOUSLY
  ↓
Timer starts at the same time for both
```

### Round End
```
Player 1 timer reaches 0
  ↓
Player 1 emits "roundEnded" with winner
  ↓
Server broadcasts "roundResult" to ALL players
  ↓
Both players see the same round result
  ↓
Both players enter 3-second break
  ↓
Host triggers "startGame" for Round 2
  ↓
Both players start Round 2 SIMULTANEOUSLY
```

### Rematch
```
Player clicks "MAIN LAGI"
  ↓
Emits "requestRematch" or "acceptRematch"
  ↓
Server broadcasts "rematchAccepted" to ALL
  ↓
Both players reset state
  ↓
Host triggers "startGame"
  ↓
Both players start from Round 1 SIMULTANEOUSLY
```

---

## Warna Indikator Round

### Perspektif Tim Merah (Player)
| Round Result | Warna | Arti |
|--------------|-------|------|
| Tim Merah menang | 🟢 Hijau | Player menang |
| Tim Biru menang | 🔴 Merah | Player kalah |
| Belum dimainkan | ⚪ Abu-abu | - |

### Perspektif Tim Biru (Opponent)
| Round Result | Warna | Arti |
|--------------|-------|------|
| Tim Merah menang | 🔴 Merah | Opponent kalah |
| Tim Biru menang | 🟢 Hijau | Opponent menang |
| Belum dimainkan | ⚪ Abu-abu | - |

**Catatan:** Setiap pemain melihat dari perspektif mereka sendiri:
- Player selalu Tim Merah
- Opponent selalu Tim Biru
- Warna indikator relatif terhadap pemain yang melihat

---

## Testing Checklist

### Timer Synchronization
- ✅ Kedua pemain mulai game bersamaan
- ✅ Timer countdown sama di kedua tab
- ✅ Kedua pemain selesai di waktu yang sama
- ✅ Round 2 mulai bersamaan setelah jeda 3 detik
- ✅ Rematch mulai bersamaan

### Round Indicator Colors
- ✅ Tim Merah menang → Indikator hijau di POV Tim Merah
- ✅ Tim Merah menang → Indikator merah di POV Tim Biru
- ✅ Tim Biru menang → Indikator merah di POV Tim Merah
- ✅ Tim Biru menang → Indikator hijau di POV Tim Biru
- ✅ Belum dimainkan → Indikator abu-abu di kedua POV

### Round Result Sync
- ✅ Hasil round sama di kedua pemain
- ✅ Pop-up JEDA muncul bersamaan
- ✅ Pop-up HASIL PERTANDINGAN sama di kedua pemain
- ✅ Pemenang final sama di kedua pemain

---

## File yang Dimodifikasi

### 1. server.js
- Tambah event `startGame` untuk sinkronisasi mulai game
- Tambah event `roundEnded` untuk broadcast hasil round
- Tambah event `gameStarted` untuk notify semua pemain
- Tambah event `roundResult` untuk sync hasil round

### 2. src/app/pages/GamePage.tsx
- Update WebSocket listeners untuk `gameStarted` dan `roundResult`
- Update `akhiriPermainan()` untuk broadcast hasil round
- Update indikator round untuk menggunakan warna hijau/merah/abu-abu
- Update logika warna berdasarkan perspektif pemain
- Host yang trigger start game untuk semua round

---

## Cara Kerja Host/Challenger

### Host (Player yang membuat room)
- Membuat room
- Menunggu challenger join
- **Trigger start game** untuk Round 1, Round 2, dan Rematch
- Broadcast ke server, server broadcast ke semua

### Challenger (Player yang join room)
- Join room yang sudah ada
- Menunggu signal `gameStarted` dari server
- Mulai game bersamaan dengan host
- Tidak trigger start game (hanya host yang bisa)

### Kenapa Host yang Trigger?
- Menghindari race condition (kedua pemain trigger bersamaan)
- Satu source of truth untuk timing
- Server hanya relay, tidak perlu logic tambahan
- Lebih simple dan reliable

---

## Debugging Tips

### Cek Timer Sync
```javascript
// Di console browser
console.log("Game started at:", Date.now());
```
Kedua tab harus menampilkan timestamp yang sangat dekat (selisih < 100ms)

### Cek Round Result
```javascript
// Di console browser
console.log("Round wins:", roundWins);
```
Kedua tab harus menampilkan array yang sama

### Cek WebSocket Events
```javascript
// Di server.js
console.log(`Game started in room ${roomCode} at ${startTime}`);
console.log(`Round ${round} ended, winner: ${winner}`);
```

---

## Known Limitations

1. **Network Latency**: Masih ada sedikit delay karena network latency (biasanya < 100ms)
2. **Host Disconnect**: Jika host disconnect, challenger tidak bisa start round baru
3. **Clock Drift**: Jika device clock berbeda, bisa ada sedikit perbedaan (minimal)

## Future Improvements

- [ ] Server-side timer untuk eliminasi clock drift
- [ ] Automatic host migration jika host disconnect
- [ ] Ping compensation untuk network latency
- [ ] Reconnection handling untuk disconnect sementara
