# 🧪 Testing Rematch System - Step by Step

## ✅ **FIX YANG SUDAH DILAKUKAN:**

**Masalah:** Event listener `rematchRequested` ter-override karena useEffect dependency array yang terlalu banyak.

**Solusi:** Memisahkan rematch event listeners ke useEffect terpisah dengan dependency minimal.

---

## 🚀 **CARA TESTING:**

### **STEP 1: Restart Server & Client**

**PENTING:** Harus restart kedua-duanya!

```bash
# Terminal 1 - Stop server (Ctrl+C) lalu:
npm start

# Terminal 2 - Stop client (Ctrl+C) lalu:
npm run dev
```

---

### **STEP 2: Buka 2 Browser Tabs**

**Tab 1 (User 1 - Azhar):**
1. Buka `http://localhost:5173`
2. Tekan **F12** untuk buka Console
3. Masuk ke Lobby
4. Create Room (catat kode room)
5. Tunggu User 2 join

**Tab 2 (User 2 - Fasha):**
1. Buka `http://localhost:5173` (**tab baru**, jangan refresh tab 1)
2. Tekan **F12** untuk buka Console
3. Masuk ke Lobby
4. Join Room (masukkan kode dari Tab 1)

---

### **STEP 3: Mulai Game**

1. Salah satu user klik "MULAI" atau tekan SPASI
2. Countdown 3-2-1-FIGHT muncul
3. Main game sampai waktu habis (60 detik)
4. Score popup muncul di kedua tab

---

### **STEP 4: Test Rematch - Scenario 1 (Normal Flow)**

**Di Tab 1 (Azhar):**
1. Klik tombol **"MAIN LAGI"**
2. **CEK CONSOLE** - harus muncul:
   ```
   📤 Sending rematch request
   ```
3. **CEK BUTTON** - harus berubah jadi **"BATALKAN"** (warna merah)

**Di Tab 2 (Fasha):**
1. **CEK CONSOLE** - harus muncul:
   ```
   🔔 Received rematchRequested event from opponent
   ```
2. **CEK BUTTON** - harus berubah jadi **"TERIMA TANTANGAN"** (warna hijau)
3. Klik **"TERIMA TANTANGAN"**
4. Countdown 3-2-1-FIGHT muncul
5. Game restart!

**Di Server Console (Terminal 1):**
```
📤 Player [socket-id] requested rematch in room [room-code]
   Current requests: 1/2
🔔 Notifying opponent in room [room-code]
```

---

### **STEP 5: Test Rematch - Scenario 2 (Reverse Flow)**

Setelah game selesai lagi:

**Di Tab 2 (Fasha):**
1. Klik tombol **"MAIN LAGI"** (Fasha yang request duluan kali ini)
2. **CEK CONSOLE** - harus muncul:
   ```
   📤 Sending rematch request
   ```
3. **CEK BUTTON** - harus berubah jadi **"BATALKAN"** (warna merah)

**Di Tab 1 (Azhar):**
1. **CEK CONSOLE** - harus muncul:
   ```
   🔔 Received rematchRequested event from opponent
   ```
2. **CEK BUTTON** - harus berubah jadi **"TERIMA TANTANGAN"** (warna hijau)
3. Klik **"TERIMA TANTANGAN"**
4. Game restart!

---

### **STEP 6: Test Cancel**

Setelah game selesai lagi:

**Di Tab 1 (Azhar):**
1. Klik **"MAIN LAGI"** → button jadi **"BATALKAN"**
2. Klik **"BATALKAN"** lagi
3. **CEK CONSOLE** - harus muncul:
   ```
   ❌ Cancelling rematch request
   ```
4. **CEK BUTTON** - harus kembali ke **"MAIN LAGI"**

**Di Tab 2 (Fasha):**
1. **CEK CONSOLE** - harus muncul:
   ```
   ❌ Received rematchCancelled event from opponent
   ```
2. **CEK BUTTON** - harus kembali ke **"MAIN LAGI"**

---

### **STEP 7: Test Auto-Accept**

Setelah game selesai lagi:

**Di Tab 1 & Tab 2 (Bersamaan):**
1. Klik **"MAIN LAGI"** di kedua tab hampir bersamaan (< 1 detik)
2. **CEK SERVER CONSOLE** - harus muncul:
   ```
   ✅ Both players requested rematch in room [room-code] - AUTO ACCEPT
   ```
3. **CEK KEDUA TAB** - countdown langsung muncul
4. Game restart tanpa perlu konfirmasi!

---

## 📊 **EXPECTED CONSOLE OUTPUT:**

### **Saat Register Event Listeners:**
```
🔧 Registering rematch event listeners
```

### **Saat User 1 Request:**
```
Tab 1: 📤 Sending rematch request
Server: 📤 Player abc123 requested rematch in room ROOM01
Server:    Current requests: 1/2
Server: 🔔 Notifying opponent in room ROOM01
Tab 2: 🔔 Received rematchRequested event from opponent
```

### **Saat User 2 Accept:**
```
Tab 2: ✅ Accepting rematch from opponent
Server: (rematch accepted logs)
Tab 1: ✅ Received rematchAccepted event
Tab 2: ✅ Received rematchAccepted event
```

### **Saat Cancel:**
```
Tab 1: ❌ Cancelling rematch request
Server: (cancel logs)
Tab 2: ❌ Received rematchCancelled event from opponent
```

---

## ✅ **SUCCESS CRITERIA:**

Rematch system bekerja dengan benar jika:

- [x] Console menampilkan "🔧 Registering rematch event listeners" saat page load
- [x] User 1 klik "MAIN LAGI" → User 2 melihat "TERIMA TANTANGAN"
- [x] User 2 klik "MAIN LAGI" → User 1 melihat "TERIMA TANTANGAN"
- [x] Kedua user klik bersamaan → Auto-accept (langsung countdown)
- [x] User bisa cancel dengan klik "BATALKAN"
- [x] Button warna berubah sesuai state (hijau/merah)
- [x] Console log muncul sesuai expected output

---

## ❌ **JIKA MASIH TIDAK WORK:**

### **1. Hard Refresh Browser**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **2. Clear Browser Cache**
1. Tekan F12
2. Klik tab "Network"
3. Centang "Disable cache"
4. Refresh page

### **3. Check Socket Connection**
```javascript
// Di browser console kedua tab
console.log("Socket connected:", socket.connected);
console.log("Socket ID:", socket.id);
console.log("Room code:", kodeRoom);
```

### **4. Manual Event Test**
```javascript
// Di Tab 1 console
socket.emit("requestRematch", { roomCode: "ROOM01" });

// Di Tab 2 console - harus muncul log
// 🔔 Received rematchRequested event from opponent
```

### **5. Restart Everything**
```bash
# Stop semua (Ctrl+C di kedua terminal)

# Clear cache
npm cache clean --force

# Rebuild
npm run build

# Restart
npm start    # Terminal 1
npm run dev  # Terminal 2

# Hard refresh browser (Ctrl + Shift + R)
```

---

## 🐛 **TROUBLESHOOTING:**

### **Issue: Console tidak muncul "🔧 Registering rematch event listeners"**

**Solusi:** Event listener tidak terdaftar
```bash
# Hard refresh browser
Ctrl + Shift + R
```

### **Issue: Button tidak berubah meskipun console log muncul**

**Solusi:** State tidak update
```javascript
// Di console, cek state
console.log("rematchReceived:", rematchReceived);
console.log("rematchRequested:", rematchRequested);
```

### **Issue: Server tidak emit event**

**Solusi:** Room tidak ditemukan
```javascript
// Di server.js, cek rooms
console.log("Active rooms:", Object.keys(rooms));
```

---

## 📸 **SCREENSHOT CHECKLIST:**

Jika masih tidak work, ambil screenshot:

1. **Tab 1 Console** - setelah klik "MAIN LAGI"
2. **Tab 2 Console** - setelah Tab 1 klik "MAIN LAGI"
3. **Tab 1 Button** - harus "BATALKAN" (merah)
4. **Tab 2 Button** - harus "TERIMA TANTANGAN" (hijau)
5. **Server Console** - harus ada log rematch

---

## 🎯 **WHAT CHANGED:**

### **Before (Broken):**
```typescript
useEffect(() => {
  // ... banyak event listeners lain ...
  
  socket.on("rematchRequested", () => {
    setRematchReceived(true);
  });
  
  // ... cleanup ...
}, [isMultiplayer, kodeRoom, namaPlayer, navigate, state?.isHost]);
// ❌ Dependency terlalu banyak, event listener ter-override
```

### **After (Fixed):**
```typescript
// Separate useEffect untuk rematch events
useEffect(() => {
  if (!isMultiplayer) return;

  const handleRematchRequested = () => {
    console.log("🔔 Received rematchRequested event");
    setRematchReceived(true);
  };

  socket.on("rematchRequested", handleRematchRequested);

  return () => {
    socket.off("rematchRequested", handleRematchRequested);
  };
}, [isMultiplayer, kodeRoom]);
// ✅ Dependency minimal, event listener stabil
```

---

## 🚀 **NEXT STEPS:**

Setelah testing berhasil:

1. ✅ Test semua scenarios (normal, reverse, cancel, auto-accept)
2. ✅ Test dengan network latency (throttle di DevTools)
3. ✅ Test disconnect scenarios
4. ✅ Test dengan multiple rematch cycles
5. ✅ Deploy ke production

---

**Last Updated**: 2026-05-11  
**Version**: 1.1.1-fixed  
**Status**: Ready for Testing
