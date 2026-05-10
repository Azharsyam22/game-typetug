# Sudden Death System - TypeTug Game

## Overview
Sistem 3 round dengan Sudden Death jika terjadi draw (1-1) setelah Round 2.

---

## Alur Lengkap

### Round 1
```
Game mulai
  ↓
60 detik gameplay
  ↓
Round 1 selesai
  ↓
Pop-up SKOR ROUND 1 (3 detik)
  - Menampilkan pemenang
  - Menampilkan KPM & Akurasi kedua pemain
  ↓
Auto lanjut ke Round 2
  ↓
Pop-up "ROUND 2" (1s)
  ↓
Pop-up "FIGHT!" (1s)
  ↓
Round 2 mulai
```

### Round 2 - Ada Pemenang (2-0 atau 0-2)
```
Round 2 selesai
  ↓
Pop-up SKOR ROUND 2 (3 detik)
  - Menampilkan pemenang
  - Menampilkan KPM & Akurasi kedua pemain
  ↓
Pop-up HASIL AKHIR
  - Menampilkan hasil kedua round
  - Menampilkan pemenang final
  - Tombol "MAIN LAGI" ✅
  - Tombol "KEMBALI KE LOBI" ✅
```

### Round 2 - DRAW (1-1)
```
Round 2 selesai
  ↓
Pop-up SKOR ROUND 2 (3 detik)
  - Menampilkan pemenang
  - Menampilkan KPM & Akurasi kedua pemain
  - TIDAK ADA TOMBOL ❌
  ↓
Auto lanjut ke SUDDEN DEATH
  ↓
Pop-up "SUDDEN DEATH" (1s)
  ↓
Pop-up "FIGHT!" (1s)
  ↓
Sudden Death mulai
```

### Sudden Death
```
Sudden Death selesai
  ↓
Pop-up SKOR SUDDEN DEATH (3 detik)
  - Menampilkan pemenang
  - Menampilkan KPM & Akurasi kedua pemain
  ↓
Pop-up HASIL AKHIR
  - Menampilkan hasil ketiga round
  - Menampilkan pemenang final
  - Tombol "MAIN LAGI" ✅
  - Tombol "KEMBALI KE LOBI" ✅
```

---

## Pop-up Skor Round

### Tampilan
```
┌──────────────────────────────────────┐
│          ROUND 1 / ROUND 2           │
│       atau SUDDEN DEATH              │
│                                      │
│         FASHA MENANG!                │
│                                      │
│  ┌────────────┐  ┌────────────┐    │
│  │   FASHA    │  │    BOT     │    │
│  │            │  │            │    │
│  │     45     │  │     38     │    │
│  │    KPM     │  │    KPM     │    │
│  │            │  │            │    │
│  │    95%     │  │    92%     │    │
│  │  AKURASI   │  │  AKURASI   │    │
│  └────────────┘  └────────────┘    │
│                                      │
└──────────────────────────────────────┘

(Muncul 3 detik, lalu auto lanjut)
```

**Kapan Muncul:**
- Setelah Round 1 selesai
- Setelah Round 2 selesai
- Setelah Sudden Death selesai

**Kapan Ada Tombol:**
- ❌ Setelah Round 1 (tidak ada tombol, auto lanjut)
- ✅ Setelah Round 2 jika ada pemenang (ada tombol)
- ❌ Setelah Round 2 jika draw (tidak ada tombol, auto lanjut)
- ✅ Setelah Sudden Death (ada tombol)

---

## Pop-up Hasil Akhir

### Tampilan
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
│  │ 🟢SD SUDDEN DEATH    FASHA MENANG          │    │
│  │ ──────────────────────────────────────     │    │
│  │ FASHA              BOT                     │    │
│  │ KPM: 50            KPM: 45                 │    │
│  │ AKURASI: 97%       AKURASI: 93%            │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         PEMENANG FINAL                     │    │
│  │         🏆 FASHA 🏆                        │    │
│  │            2 - 1                           │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [MAIN LAGI] [KEMBALI KE LOBI]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Kapan Muncul:**
- Setelah Round 2 jika ada pemenang (2-0 atau 0-2)
- Setelah Sudden Death selesai

---

## Indikator Round di Header

### Tampilan
```
ROUND: ⚪1 ⚪2 ⚪SD  → Awal game
ROUND: 🟢1 ⚪2 ⚪SD  → Setelah Round 1 (player menang)
ROUND: 🟢1 🔴2 ⚪SD  → Setelah Round 2 (player kalah, draw)
ROUND: 🟢1 🔴2 🟢SD  → Setelah Sudden Death (player menang)
```

**Warna:**
- 🟢 Hijau = Player menang
- 🔴 Merah = Player kalah
- ⚪ Abu-abu = Belum dimainkan

**Label:**
- Round 1: "1"
- Round 2: "2"
- Sudden Death: "SD"

---

## Implementasi

### State
```typescript
const [currentRound, setCurrentRound] = useState(1);
const [roundWins, setRoundWins] = useState<("merah" | "biru" | null)[]>([null, null, null]);
const [showScorePopup, setShowScorePopup] = useState(false); // Pop-up hasil akhir
const [showRoundScorePopup, setShowRoundScorePopup] = useState(false); // Pop-up skor round
const [currentRoundScore, setCurrentRoundScore] = useState(1);
const [roundStats, setRoundStats] = useState<{
  round: number;
  playerWpm: number;
  playerAccuracy: number;
  opponentWpm: number;
  opponentAccuracy: number;
}[]>([]);
```

### Logic Akhir Permainan
```typescript
const akhiriPermainan = () => {
  // Tentukan pemenang
  const winner = posiTali > 50 ? "merah" : posiTali < 50 ? "biru" : null;
  
  // Update round wins
  const newRoundWins = [...roundWins];
  newRoundWins[currentRound - 1] = winner;
  setRoundWins(newRoundWins);
  
  // Simpan stats
  setRoundStats(prevStats => [...prevStats, { ... }]);
  
  // Tampilkan pop-up skor round
  setCurrentRoundScore(currentRound);
  setShowRoundScorePopup(true);
  
  if (currentRound === 1) {
    // Round 1 selesai - auto lanjut ke Round 2 setelah 3 detik
    setTimeout(() => {
      setShowRoundScorePopup(false);
      setCurrentRound(2);
      // Mulai Round 2
    }, 3000);
  } else if (currentRound === 2) {
    // Round 2 selesai - cek draw atau ada pemenang
    const redWins = newRoundWins.slice(0, 2).filter(w => w === "merah").length;
    const blueWins = newRoundWins.slice(0, 2).filter(w => w === "biru").length;
    
    if (redWins === blueWins) {
      // DRAW - lanjut ke Sudden Death setelah 3 detik
      setTimeout(() => {
        setShowRoundScorePopup(false);
        setCurrentRound(3);
        // Mulai Sudden Death
      }, 3000);
    } else {
      // Ada pemenang - tampilkan hasil akhir setelah 3 detik
      setTimeout(() => {
        setShowRoundScorePopup(false);
        setShowScorePopup(true);
      }, 3000);
    }
  } else {
    // Sudden Death selesai - tampilkan hasil akhir setelah 3 detik
    setTimeout(() => {
      setShowRoundScorePopup(false);
      setShowScorePopup(true);
    }, 3000);
  }
};
```

---

## Skenario

### Skenario 1: Player Menang 2-0
```
Round 1: Player menang (1-0)
  ↓ Pop-up skor Round 1 (3s)
  ↓ Auto lanjut
Round 2: Player menang (2-0)
  ↓ Pop-up skor Round 2 (3s)
  ↓ Pop-up hasil akhir
  ↓ Tombol MAIN LAGI & LOBI
```

### Skenario 2: Draw 1-1 → Sudden Death
```
Round 1: Player menang (1-0)
  ↓ Pop-up skor Round 1 (3s)
  ↓ Auto lanjut
Round 2: Bot menang (1-1)
  ↓ Pop-up skor Round 2 (3s, TIDAK ADA TOMBOL)
  ↓ Auto lanjut
Sudden Death: Player menang (2-1)
  ↓ Pop-up skor Sudden Death (3s)
  ↓ Pop-up hasil akhir
  ↓ Tombol MAIN LAGI & LOBI
```

### Skenario 3: Bot Menang 2-0
```
Round 1: Bot menang (0-1)
  ↓ Pop-up skor Round 1 (3s)
  ↓ Auto lanjut
Round 2: Bot menang (0-2)
  ↓ Pop-up skor Round 2 (3s)
  ↓ Pop-up hasil akhir
  ↓ Tombol MAIN LAGI & LOBI
```

---

## Mode Multiplayer

### Sinkronisasi
- Pop-up skor round muncul bersamaan di kedua pemain
- Auto lanjut ke round berikutnya bersamaan
- Sudden Death mulai bersamaan jika draw

### Tombol Main Lagi
- Player 1 klik "MAIN LAGI" → Kirim request
- Player 2 lihat "TERIMA TANTANGAN"
- Player 2 klik "TERIMA TANTANGAN" → Game auto-start dari Round 1

---

## Testing Checklist

### Round 1
- ✅ Round 1 selesai → Pop-up skor muncul
- ✅ Pop-up menampilkan pemenang
- ✅ Pop-up menampilkan KPM & Akurasi
- ✅ Setelah 3 detik → Auto lanjut Round 2
- ✅ Tidak ada tombol di pop-up

### Round 2 - Ada Pemenang
- ✅ Round 2 selesai → Pop-up skor muncul
- ✅ Setelah 3 detik → Pop-up hasil akhir
- ✅ Ada tombol MAIN LAGI & LOBI

### Round 2 - Draw
- ✅ Round 2 selesai → Pop-up skor muncul
- ✅ Tidak ada tombol di pop-up
- ✅ Setelah 3 detik → Auto lanjut Sudden Death
- ✅ Pop-up "SUDDEN DEATH" muncul

### Sudden Death
- ✅ Sudden Death selesai → Pop-up skor muncul
- ✅ Setelah 3 detik → Pop-up hasil akhir
- ✅ Ada tombol MAIN LAGI & LOBI
- ✅ Hasil akhir menampilkan 3 round

### Indikator
- ✅ 3 bulatan di header (1, 2, SD)
- ✅ Warna hijau untuk menang
- ✅ Warna merah untuk kalah
- ✅ Warna abu-abu untuk belum dimainkan

---

## File yang Dimodifikasi

- `src/app/pages/GamePage.tsx`
  - Tambah state `showRoundScorePopup`, `currentRoundScore`
  - Update `roundWins` menjadi array 3 elemen
  - Update `akhiriPermainan()` untuk handle 3 round
  - Tambah pop-up skor round
  - Update indikator round untuk 3 bulatan
  - Update pop-up ROUND untuk menampilkan "SUDDEN DEATH"

---

## Summary

✅ **3 Round System** - Round 1, Round 2, Sudden Death (jika draw)  
✅ **Pop-up Skor Round** - Muncul setelah setiap round (3 detik)  
✅ **Auto Lanjut** - Otomatis lanjut ke round berikutnya  
✅ **Sudden Death** - Hanya jika draw (1-1) setelah Round 2  
✅ **Tombol Kondisional** - Hanya muncul di pop-up hasil akhir  
✅ **Stats Lengkap** - KPM & Akurasi ditampilkan per round

Game sekarang memiliki sistem round yang lengkap dengan Sudden Death! 🎮✅
