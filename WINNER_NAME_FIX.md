# Fix: Winner Name Display Bug

## Masalah
Sebelumnya, di mode multiplayer, setiap pemain mengirim hasil round dari perspektif mereka sendiri:
- Fasha menang → Di tab Fasha: winner = "merah", Di tab Azhar: winner = "biru" 
- Ini menyebabkan konflik karena kedua pemain mengirim hasil yang berbeda
- Pop-up menampilkan pemenang yang salah karena data tidak konsisten

## Solusi
1. **Server menentukan pemenang** - Bukan client yang menentukan
2. **Gunakan nama pemain asli** - Bukan "merah"/"biru"
3. **Single source of truth** - Server membandingkan stats dan broadcast pemenang yang benar

## Perubahan

### server.js
- ✅ Hapus event `roundEnded` (tidak diperlukan lagi)
- ✅ Update `playerFinished` untuk menerima `playerName`
- ✅ Server membandingkan WPM kedua pemain untuk menentukan pemenang
- ✅ Server broadcast `roundResult` dengan `winnerName` dan `winnerPlayerId`

### GamePage.tsx
- ✅ Ubah `roundWins` dari `("merah" | "biru" | null)[]` menjadi `(string | null)[]`
- ✅ Simpan nama pemenang asli (e.g., "Fasha", "Azhar", "BOT")
- ✅ Hapus pengiriman `roundEnded` dari client
- ✅ Kirim `playerName` saat emit `playerFinished`
- ✅ Update round score popup untuk menampilkan nama pemenang yang benar
- ✅ Update round indicators untuk menggunakan nama pemain
- ✅ Update final results untuk menghitung berdasarkan nama pemain
- ✅ Fix mode bot untuk konsisten menggunakan nama pemain

## Logika Penentuan Pemenang (Server)
```javascript
// Bandingkan WPM
if (player1.stats.playerWpm > player2.stats.playerWpm) {
  winner = player1.playerName;
} else if (player2.stats.playerWpm > player1.stats.playerWpm) {
  winner = player2.playerName;
} else {
  // Jika WPM sama, bandingkan accuracy
  if (player1.stats.playerAccuracy > player2.stats.playerAccuracy) {
    winner = player1.playerName;
  } else if (player2.stats.playerAccuracy > player1.stats.playerAccuracy) {
    winner = player2.playerName;
  }
  // Jika masih sama, null (draw)
}
```

## Hasil
- ✅ Kedua pemain melihat nama pemenang yang sama
- ✅ Jika Fasha menang, kedua tab menampilkan "FASHA MENANG"
- ✅ Round indicators menampilkan warna yang benar dari perspektif masing-masing pemain
- ✅ Final results menampilkan pemenang yang akurat
- ✅ Tidak ada lagi duplikasi atau konflik pop-up

## Testing
1. Buka 2 tab browser
2. Tab 1: Nama "Fasha", buat room
3. Tab 2: Nama "Azhar", join room yang sama
4. Mainkan game dan pastikan:
   - Pemain dengan KPM lebih tinggi menang
   - Kedua tab menampilkan nama pemenang yang sama
   - Round indicators menampilkan warna yang benar (hijau = menang, merah = kalah)
   - Final results akurat
