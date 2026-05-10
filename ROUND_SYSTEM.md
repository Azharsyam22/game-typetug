# Sistem 2 Round - TypeTug Game

## Overview
Game TypeTug sekarang menggunakan sistem **Best of 2 Rounds** (BO2) dimana pemain harus memenangkan 2 round untuk menjadi pemenang final.

---

## 🎮 Alur Permainan

### 1. **Mulai Game**
- User menekan SPASI atau auto-start (multiplayer)
- Pop-up "ROUND 1" muncul (1 detik)
- Pop-up "FIGHT!" muncul (1 detik)
- Round 1 dimulai (60 detik)

### 2. **Setelah Round 1 Selesai**
- Sistem menentukan pemenang round 1 berdasarkan `posiTali`
  - `posiTali > 50` → Tim Merah menang
  - `posiTali < 50` → Tim Biru menang
  - `posiTali === 50` → Seri
- Indikator round di header berubah warna:
  - 🔴 Merah = Tim Merah menang
  - 🔵 Biru = Tim Biru menang
  - ⚪ Abu-abu = Belum dimainkan/Seri
- Pop-up "JEDA" muncul selama **3 detik**
  - Menampilkan hasil Round 1
  - Menampilkan "BERSIAP UNTUK ROUND 2..."

### 3. **Round 2**
- Setelah jeda 3 detik, otomatis masuk Round 2
- Pop-up "ROUND 2" muncul (1 detik)
- Pop-up "FIGHT!" muncul (1 detik)
- Round 2 dimulai (60 detik)

### 4. **Setelah Round 2 Selesai**
- Sistem menentukan pemenang round 2
- Pop-up "HASIL PERTANDINGAN" muncul dengan:
  - Hasil kedua round
  - Pemenang final berdasarkan jumlah kemenangan
  - Skor akhir (contoh: 2-0, 1-1)
  - Tombol "MAIN LAGI" dan "KEMBALI KE LOBI"

---

## 🎯 Indikator Round (Header)

### Posisi
Terletak di header, sebelah kanan status game

### Visual
```
ROUND: ⚪1 ⚪2  → Awal game (abu-abu)
ROUND: 🔴1 ⚪2  → Setelah Round 1 (merah menang)
ROUND: 🔴1 🔵2  → Setelah Round 2 (biru menang)
```

### Styling
- **Belum dimainkan**: Border & background abu-abu (#9A8878, #D8CEB8)
- **Tim Merah menang**: Border & background merah (#C84040)
- **Tim Biru menang**: Border & background biru (#3A70B0)
- **Round aktif**: Outline emas (#C08030) dengan shadow

### Ukuran
- Diameter: 24px
- Border: 3px solid
- Font size: 9px
- Angka round di tengah bulatan

---

## 🎨 Pop-up Design

### 1. **ROUND X Pop-up**
```
┌─────────────────────────┐
│  [Decorative corners]   │
│                         │
│      ROUND 1/2          │
│                         │
└─────────────────────────┘
```
- Background: Gradient parchment (#F4EDE0 → #E8DFCC)
- Border: 6px solid #C08030
- Text: 48-72px, gold (#C08030)
- Shadow: 6px 6px 0 #8C5A35
- Corners: 16x16px gold squares
- Durasi: 1 detik

### 2. **FIGHT! Pop-up**
```
┌─────────────────────────┐
│  [Decorative corners]   │
│                         │
│       FIGHT!            │
│                         │
└─────────────────────────┘
```
- Background: Gradient parchment (sama dengan ROUND)
- Border: 6px solid #C08030
- Text: 56-96px, merah (#C84040)
- Shadow: 6px 6px 0 #8C5A35
- Corners: 16x16px gold squares
- Durasi: 1 detik

### 3. **JEDA Pop-up**
```
┌─────────────────────────────┐
│  [Decorative corners]       │
│                             │
│  ROUND 1: TIM MERAH         │
│  ─────────────────────      │
│  BERSIAP UNTUK ROUND 2...   │
│                             │
└─────────────────────────────┘
```
- Background: Gradient parchment
- Border: 6px solid #C08030
- Text winner: 24-36px (warna sesuai pemenang)
- Text info: 16-20px, abu-abu (#7A6858)
- Durasi: 3 detik

### 4. **HASIL PERTANDINGAN Pop-up**
```
┌──────────────────────────────────┐
│  [Decorative corners]            │
│                                  │
│    HASIL PERTANDINGAN            │
│                                  │
│  ┌─────────────────────────┐    │
│  │ ⚪1  ROUND 1  TIM MERAH  │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ ⚪2  ROUND 2  TIM BIRU   │    │
│  └─────────────────────────┘    │
│                                  │
│  ┌─────────────────────────┐    │
│  │   PEMENANG FINAL         │    │
│  │   🏆 TIM MERAH 🏆        │    │
│  │        2 - 0             │    │
│  └─────────────────────────┘    │
│                                  │
│  [MAIN LAGI] [KEMBALI KE LOBI]  │
│                                  │
└──────────────────────────────────┘
```
- Background: #F4EDE0
- Border: 6px solid #8C5A35
- Title: 28px, gold (#C08030)
- Round cards: Background #E8DFCC
- Final winner box: Gradient background
- Buttons: Retro style dengan hover effect

---

## 💾 State Management

### New States
```typescript
const [currentRound, setCurrentRound] = useState(1);
const [roundWins, setRoundWins] = useState<("merah" | "biru" | null)[]>([null, null]);
const [showScorePopup, setShowScorePopup] = useState(false);
```

### Fase Game
```typescript
type Fase = "menunggu" | "hitung" | "bermain" | "jeda" | "selesai"
```
- **menunggu**: Waiting for players
- **hitung**: Countdown (ROUND X → FIGHT!)
- **bermain**: Game in progress
- **jeda**: 3 second break between rounds
- **selesai**: Game finished, showing score

---

## 🔄 Logic Flow

### `akhiriPermainan()`
```typescript
1. Tentukan pemenang round (berdasarkan posiTali)
2. Update roundWins array
3. Cek currentRound:
   - Jika Round 1:
     * Set fase = "jeda"
     * Setelah 3 detik → mulai Round 2
   - Jika Round 2:
     * Set showScorePopup = true
     * Set fase = "selesai"
```

### `resetPermainan()`
```typescript
1. Reset semua data game
2. Set currentRound = 1
3. Set roundWins = [null, null]
4. Set showScorePopup = false
5. Set fase = "menunggu"
```

### `mulaiPermainan()`
```typescript
1. Reset data game
2. Tampilkan "ROUND X" (1 detik)
3. Tampilkan "FIGHT!" (1 detik)
4. Mulai game (fase = "bermain")
```

---

## 🎯 Penentu Pemenang

### Per Round
```typescript
const winner = 
  posiTali > 50 ? "merah" :
  posiTali < 50 ? "biru" :
  null; // seri
```

### Final Winner
```typescript
const redWins = roundWins.filter(w => w === "merah").length;
const blueWins = roundWins.filter(w => w === "biru").length;
const finalWinner = 
  redWins > blueWins ? "merah" :
  blueWins > redWins ? "biru" :
  null; // seri
```

---

## 🎨 Blur Effects

Background gameplay mendapat blur effect saat:
- Pop-up "ROUND X" muncul
- Pop-up "FIGHT!" muncul
- Fase "jeda" (3 detik)
- Pop-up "HASIL PERTANDINGAN" muncul

```css
filter: blur(4px);
backdrop-filter: blur(8px);
```

---

## 🔧 Multiplayer Sync

### Socket Events (Tetap sama)
- `gameEnded` hanya dikirim setelah Round 2 selesai
- Kedua pemain akan sync otomatis untuk:
  - Hasil Round 1
  - Jeda 3 detik
  - Mulai Round 2
  - Hasil final

---

## 📊 Testing Checklist

- ✅ Round 1 dimulai dengan pop-up yang benar
- ✅ Indikator round berubah warna sesuai pemenang
- ✅ Jeda 3 detik muncul setelah Round 1
- ✅ Round 2 dimulai otomatis setelah jeda
- ✅ Pop-up score muncul setelah Round 2
- ✅ Pemenang final ditentukan dengan benar
- ✅ Blur effect berfungsi di semua pop-up
- ✅ Reset game mengembalikan ke Round 1
- ✅ Multiplayer sync berfungsi untuk kedua round

---

## 🎮 User Experience

### Timeline
```
[SPASI] → ROUND 1 (1s) → FIGHT! (1s) → Game 60s → 
JEDA (3s) → ROUND 2 (1s) → FIGHT! (1s) → Game 60s → 
HASIL PERTANDINGAN
```

### Total Duration
- Round 1: ~62 detik (2s pop-up + 60s game)
- Jeda: 3 detik
- Round 2: ~62 detik (2s pop-up + 60s game)
- **Total: ~127 detik (~2 menit)**

---

## 🚀 Future Enhancements

Possible improvements:
- [ ] Best of 3 rounds option
- [ ] Round statistics (WPM, accuracy per round)
- [ ] Replay system
- [ ] Tournament bracket mode
- [ ] Custom round duration
- [ ] Sudden death mode (jika 1-1)
