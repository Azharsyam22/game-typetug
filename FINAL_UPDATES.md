# Final Updates - TypeTug Game

## Update yang Dilakukan

### 1. ❌ Hapus Jeda 3 Detik
**Sebelum:**
- Round 1 selesai → Pop-up JEDA (3 detik) → Round 2

**Sesudah:**
- Round 1 selesai → Langsung ke Round 2 (delay 0.5 detik)

**Alasan:**
- Lebih cepat dan smooth
- Tidak perlu menunggu lama
- User bisa langsung lanjut

---

### 2. ✅ Tampilkan WPM dan Akurasi di Pop-up Score

**Sebelum:**
```
┌─────────────────────────────┐
│ ⚪1  ROUND 1  FASHA MENANG   │
└─────────────────────────────┘
```

**Sesudah:**
```
┌─────────────────────────────────────┐
│ ⚪1  ROUND 1  FASHA MENANG           │
│ ─────────────────────────────────   │
│ FASHA              BOT              │
│ KPM: 45            KPM: 38          │
│ AKURASI: 95%       AKURASI: 92%     │
└─────────────────────────────────────┘
```

**Data yang Ditampilkan:**
- Nama pemain (kiri) dan lawan (kanan)
- KPM/WPM masing-masing
- Akurasi masing-masing
- Per round (Round 1 dan Round 2)

---

### 3. ✅ Tombol "MAIN LAGI" & "TERIMA TANTANGAN"

**Mode Bot:**
```
┌─────────────────────────────┐
│  [MAIN LAGI] [KEMBALI LOBI] │
└─────────────────────────────┘
```
- Klik "MAIN LAGI" → Langsung mulai dari Round 1

**Mode Multiplayer - Belum Ada Request:**
```
┌─────────────────────────────┐
│  [MAIN LAGI] [KEMBALI LOBI] │
└─────────────────────────────┘
```
- Klik "MAIN LAGI" → Kirim request rematch ke lawan
- Tombol berubah jadi "MENUNGGU..."

**Mode Multiplayer - Ada Request:**
```
┌──────────────────────────────────────┐
│  [TERIMA TANTANGAN] [KEMBALI LOBI]   │
└──────────────────────────────────────┘
```
- Klik "TERIMA TANTANGAN" → Game otomatis mulai dari Round 1

---

## Implementasi Detail

### 1. Hapus Jeda 3 Detik

**Sebelum:**
```typescript
if (currentRound === 1) {
  setTimeout(() => {
    setCurrentRound(2);
    // ... logic
  }, 3000); // 3 detik
  return "jeda";
}
```

**Sesudah:**
```typescript
if (currentRound === 1) {
  setCurrentRound(2);
  if (!isMultiplayer) {
    // Mode bot: langsung mulai Round 2
    setTimeout(() => mulaiPermainanRef.current(), 500);
  } else {
    // Mode multiplayer: siapa saja bisa mulai Round 2
    setFase("menunggu");
  }
  return "menunggu";
}
```

**Perubahan:**
- Tidak ada fase "jeda" lagi
- Langsung ke fase "menunggu"
- Mode bot: auto-start setelah 0.5 detik
- Mode multiplayer: tunggu trigger dari pemain

---

### 2. Simpan Stats Per Round

**State Baru:**
```typescript
const [roundStats, setRoundStats] = useState<{
  round: number;
  playerWpm: number;
  playerAccuracy: number;
  opponentWpm: number;
  opponentAccuracy: number;
}[]>([]);
```

**Simpan Stats Saat Round Selesai:**
```typescript
setRoundStats(prevStats => [
  ...prevStats,
  {
    round: currentRound,
    playerWpm: wpmPlayer,
    playerAccuracy: akuPlayer,
    opponentWpm: wpmBot,
    opponentAccuracy: akuBot,
  }
]);
```

**Tampilkan di Pop-up:**
```typescript
const stats = roundStats.find(s => s.round === round);

{stats && (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
    {/* Player Stats */}
    <div>
      <div>{namaPlayer.toUpperCase()}</div>
      <div>KPM: {stats.playerWpm}</div>
      <div>AKURASI: {stats.playerAccuracy}%</div>
    </div>
    
    {/* Opponent Stats */}
    <div>
      <div>{isMultiplayer ? namaMusuh.toUpperCase() : "BOT"}</div>
      <div>KPM: {stats.opponentWpm}</div>
      <div>AKURASI: {stats.opponentAccuracy}%</div>
    </div>
  </div>
)}
```

---

### 3. Tombol Main Lagi & Terima Tantangan

**Tombol Sudah Ada:**
```typescript
<TombolRetro 
  label={
    !isMultiplayer ? "MAIN LAGI" : 
    (rematchReceived ? "TERIMA TANTANGAN" : 
    (rematchRequested ? "MENUNGGU..." : "MAIN LAGI"))
  } 
  onClick={handleRematchClick} 
  accent={rematchRequested ? "#A89878" : "#4A9060"} 
  disabled={rematchRequested}
/>
```

**Logic:**
- Mode Bot: Label = "MAIN LAGI"
- Mode Multiplayer (belum request): Label = "MAIN LAGI"
- Mode Multiplayer (sudah request): Label = "MENUNGGU..." (disabled)
- Mode Multiplayer (terima request): Label = "TERIMA TANTANGAN"

**Auto-Start Setelah Rematch Accepted:**
```typescript
socket.on("rematchAccepted", () => {
  setCurrentRound(1);
  setRoundWins([null, null]);
  setRoundStats([]);
  setShowScorePopup(false);
  resetPermainan();
  
  // Otomatis mulai game setelah rematch accepted
  setTimeout(() => {
    socket.emit("startGame", { roomCode: kodeRoom });
  }, 500);
});
```

---

## Alur Lengkap

### Mode Bot
```
Round 1 mulai
  ↓
60 detik gameplay
  ↓
Round 1 selesai
  ↓
Delay 0.5 detik
  ↓
Pop-up "ROUND 2" (1s)
  ↓
Pop-up "FIGHT!" (1s)
  ↓
Round 2 mulai ✅
  ↓
60 detik gameplay
  ↓
Round 2 selesai
  ↓
Pop-up HASIL PERTANDINGAN
  ├─ Round 1: FASHA (KPM: 45, Akurasi: 95%)
  ├─ Round 2: BOT (KPM: 38, Akurasi: 92%)
  └─ Pemenang: FASHA (2-0)
  ↓
Klik "MAIN LAGI"
  ↓
Langsung mulai dari Round 1 ✅
```

### Mode Multiplayer
```
Round 1 mulai
  ↓
60 detik gameplay
  ↓
Round 1 selesai
  ↓
Fase = "menunggu"
  ↓
Salah satu pemain pencet SPASI atau klik MULAI
  ↓
Pop-up "ROUND 2" (1s)
  ↓
Pop-up "FIGHT!" (1s)
  ↓
Round 2 mulai untuk KEDUA pemain ✅
  ↓
60 detik gameplay
  ↓
Round 2 selesai
  ↓
Pop-up HASIL PERTANDINGAN
  ├─ Round 1: FASHA (KPM: 45, Akurasi: 95%) vs BUDI (KPM: 50, Akurasi: 98%)
  ├─ Round 2: BUDI (KPM: 52, Akurasi: 96%) vs FASHA (KPM: 48, Akurasi: 93%)
  └─ Pemenang: BUDI (1-1 atau 2-0)
  ↓
Player 1 klik "MAIN LAGI"
  ↓
Tombol berubah jadi "MENUNGGU..."
  ↓
Player 2 melihat "TERIMA TANTANGAN"
  ↓
Player 2 klik "TERIMA TANTANGAN"
  ↓
Game otomatis mulai dari Round 1 untuk KEDUA pemain ✅
```

---

## Visual Pop-up Score

```
┌──────────────────────────────────────────────────────┐
│              HASIL PERTANDINGAN                      │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🟢1  ROUND 1         FASHA MENANG          │    │
│  │ ──────────────────────────────────────     │    │
│  │ FASHA              BOT                     │    │
│  │ KPM: 45            KPM: 38                 │    │
│  │ AKURASI: 95%       AKURASI: 92%            │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🔴2  ROUND 2         BOT MENANG            │    │
│  │ ──────────────────────────────────────     │    │
│  │ FASHA              BOT                     │    │
│  │ KPM: 42            KPM: 48                 │    │
│  │ AKURASI: 90%       AKURASI: 95%            │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         PEMENANG FINAL                     │    │
│  │         🏆 FASHA 🏆                        │    │
│  │            1 - 1                           │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [MAIN LAGI / TERIMA TANTANGAN] [KEMBALI LOBI]     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Warna Indikator:**
- 🟢 Hijau = Player menang
- 🔴 Merah = Player kalah
- ⚪ Abu-abu = Seri

---

## Testing Checklist

### Hapus Jeda
- ✅ Round 1 selesai → Langsung ke Round 2 (tidak ada jeda 3 detik)
- ✅ Mode bot: Auto-start Round 2 setelah 0.5 detik
- ✅ Mode multiplayer: Tunggu trigger dari pemain

### Stats di Pop-up
- ✅ Round 1 stats ditampilkan (KPM, Akurasi)
- ✅ Round 2 stats ditampilkan (KPM, Akurasi)
- ✅ Nama pemain dan lawan ditampilkan
- ✅ Stats akurat sesuai gameplay

### Tombol Main Lagi
- ✅ Mode bot: "MAIN LAGI" → Langsung mulai
- ✅ Mode multiplayer: "MAIN LAGI" → Kirim request
- ✅ Mode multiplayer: "MENUNGGU..." → Disabled
- ✅ Mode multiplayer: "TERIMA TANTANGAN" → Auto-start
- ✅ Game mulai dari Round 1 setelah rematch

---

## File yang Dimodifikasi

- `src/app/pages/GamePage.tsx`
  - Hapus fase "jeda"
  - Tambah state `roundStats`
  - Simpan stats saat round selesai
  - Tampilkan stats di pop-up score
  - Update warna indikator (hijau/merah)
  - Auto-start setelah rematch accepted
  - Reset `roundStats` saat reset game

---

## Summary

✅ **Jeda dihapus** - Transisi lebih cepat  
✅ **Stats ditampilkan** - User bisa lihat performa per round  
✅ **Tombol Main Lagi** - Sudah ada dan berfungsi  
✅ **Terima Tantangan** - Auto-start setelah accepted  
✅ **Warna Indikator** - Hijau (menang) / Merah (kalah)

Game sekarang lebih smooth, informatif, dan user-friendly! 🎮✅
