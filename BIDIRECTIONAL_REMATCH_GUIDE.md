# 🔄 Bidirectional Rematch System - User Guide

## 📋 **OVERVIEW**

Sistem rematch di TypeTug sekarang **bidirectional** (dua arah) - **kedua user bisa saling menantang** untuk bermain lagi setelah game selesai!

### **Fitur Utama:**
✅ **Siapa saja bisa mengirim tantangan** - tidak ada batasan siapa yang harus request duluan  
✅ **Auto-accept** - jika kedua user klik bersamaan, langsung mulai  
✅ **Cancellable** - bisa batalkan tantangan sebelum diterima  
✅ **Clear UI** - button state yang jelas dan intuitif  

---

## 🎮 **CARA MENGGUNAKAN**

### **Scenario 1: User A Mengirim Tantangan**

1. **Game selesai** → Score popup muncul
2. **User A** klik **"MAIN LAGI"** → tombol berubah jadi **"BATALKAN"** (merah)
3. **User B** melihat tombol berubah jadi **"TERIMA TANTANGAN"** (hijau)
4. **User B** klik **"TERIMA TANTANGAN"** → countdown → game restart!

```
User A: "MAIN LAGI" → "BATALKAN" (menunggu)
User B: "MAIN LAGI" → "TERIMA TANTANGAN" (bisa accept)
```

---

### **Scenario 2: User B Mengirim Tantangan**

1. **Game selesai** → Score popup muncul
2. **User B** klik **"MAIN LAGI"** → tombol berubah jadi **"BATALKAN"** (merah)
3. **User A** melihat tombol berubah jadi **"TERIMA TANTANGAN"** (hijau)
4. **User A** klik **"TERIMA TANTANGAN"** → countdown → game restart!

```
User B: "MAIN LAGI" → "BATALKAN" (menunggu)
User A: "MAIN LAGI" → "TERIMA TANTANGAN" (bisa accept)
```

---

### **Scenario 3: Auto-Accept (Kedua User Klik Bersamaan)**

1. **Game selesai** → Score popup muncul
2. **User A** dan **User B** klik **"MAIN LAGI"** hampir bersamaan
3. **Sistem detect** → auto-accept!
4. **Countdown langsung muncul** → game restart!

```
User A: "MAIN LAGI" (klik)
User B: "MAIN LAGI" (klik dalam < 1 detik)
→ AUTO ACCEPT → Countdown → Game restart!
```

---

### **Scenario 4: Cancel Tantangan**

1. **User A** klik **"MAIN LAGI"** → tombol jadi **"BATALKAN"**
2. **User A** berubah pikiran → klik **"BATALKAN"**
3. **Tombol kembali** ke **"MAIN LAGI"** untuk kedua user
4. **User B** melihat tantangan dibatalkan

```
User A: "MAIN LAGI" → "BATALKAN" → klik → "MAIN LAGI"
User B: "TERIMA TANTANGAN" → "MAIN LAGI" (tantangan dibatalkan)
```

---

## 🎨 **BUTTON STATES**

| State | Label | Warna | Disabled | Keterangan |
|-------|-------|-------|----------|------------|
| **Idle** | "MAIN LAGI" | Hijau (#4A9060) | ❌ No | State awal, siap kirim tantangan |
| **Requesting** | "BATALKAN" | Merah (#C84040) | ❌ No | User sudah kirim tantangan, bisa cancel |
| **Receiving** | "TERIMA TANTANGAN" | Hijau (#4A9060) | ❌ No | User menerima tantangan dari lawan |

---

## 🔧 **TECHNICAL DETAILS**

### **Client-Side (GamePage.tsx)**

#### **State Variables:**
```typescript
const [rematchRequested, setRematchRequested] = useState(false);
const [rematchReceived, setRematchReceived] = useState(false);
```

#### **WebSocket Events:**
```typescript
// Terima tantangan dari lawan
socket.on("rematchRequested", () => {
  setRematchReceived(true);
});

// Lawan cancel tantangan
socket.on("rematchCancelled", () => {
  setRematchReceived(false);
  setRematchRequested(false);
});

// Tantangan diterima, restart game
socket.on("rematchAccepted", () => {
  setShowScorePopup(false);
  resetPermainan();
  setTimeout(() => {
    socket.emit("startGame", { roomCode: kodeRoom });
  }, 500);
});
```

#### **Button Logic:**
```typescript
const handleRematchClick = () => {
  if (rematchReceived) {
    // Accept tantangan dari lawan
    socket.emit("acceptRematch", { roomCode: kodeRoom });
  } else if (rematchRequested) {
    // Cancel tantangan yang sudah dikirim
    setRematchRequested(false);
    socket.emit("cancelRematch", { roomCode: kodeRoom });
  } else {
    // Kirim tantangan baru
    setRematchRequested(true);
    socket.emit("requestRematch", { roomCode: kodeRoom });
  }
};
```

---

### **Server-Side (server.js)**

#### **Room State:**
```javascript
rooms[roomCode] = {
  players: { ... },
  rematchRequests: new Set() // Track siapa yang sudah request
};
```

#### **Request Rematch Handler:**
```javascript
socket.on("requestRematch", ({ roomCode }) => {
  const room = rooms[roomCode];
  if (!room.rematchRequests) room.rematchRequests = new Set();
  room.rematchRequests.add(socket.id);
  
  // Auto-accept jika kedua pemain request
  if (room.rematchRequests.size === 2) {
    room.rematchRequests.clear();
    io.to(roomCode).emit("rematchAccepted");
  } else {
    // Beritahu lawan
    socket.to(roomCode).emit("rematchRequested");
  }
});
```

#### **Cancel Rematch Handler:**
```javascript
socket.on("cancelRematch", ({ roomCode }) => {
  const room = rooms[roomCode];
  if (room.rematchRequests) {
    room.rematchRequests.delete(socket.id);
  }
  socket.to(roomCode).emit("rematchCancelled");
});
```

#### **Accept Rematch Handler:**
```javascript
socket.on("acceptRematch", ({ roomCode }) => {
  const room = rooms[roomCode];
  if (room.rematchRequests) {
    room.rematchRequests.clear();
  }
  io.to(roomCode).emit("rematchAccepted");
});
```

---

## 🔄 **FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────┐
│              GAME SELESAI (Score Popup)                 │
│         User A & B: "MAIN LAGI" (hijau)                 │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    User A klik duluan          User B klik duluan
            │                           │
            ▼                           ▼
    A: "BATALKAN" (merah)       B: "BATALKAN" (merah)
    B: "TERIMA TANTANGAN"       A: "TERIMA TANTANGAN"
            │                           │
            └─────────────┬─────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    Receiver accept             Requester cancel
            │                           │
            ▼                           ▼
    Countdown 3-2-1         Kembali ke "MAIN LAGI"
            │
            ▼
      GAME RESTART!
```

---

## 🎯 **AUTO-ACCEPT LOGIC**

```javascript
// Server-side detection
if (room.rematchRequests.size === 2) {
  // Kedua pemain sudah request
  console.log("AUTO ACCEPT - Both players requested");
  room.rematchRequests.clear();
  io.to(roomCode).emit("rematchAccepted");
}
```

**Kondisi Auto-Accept:**
- ✅ User A klik "MAIN LAGI"
- ✅ User B klik "MAIN LAGI" sebelum User A cancel
- ✅ Server detect kedua request → emit "rematchAccepted"
- ✅ Kedua user langsung restart game

---

## 🛡️ **ERROR HANDLING**

### **Disconnect During Rematch**
```javascript
socket.on("disconnect", () => {
  // Cleanup rematch requests
  if (rooms[roomCode].rematchRequests) {
    rooms[roomCode].rematchRequests.delete(socket.id);
  }
  // Beritahu lawan
  io.to(roomCode).emit("opponentLeft");
});
```

**Behavior:**
- Jika requester disconnect → receiver melihat "Lawan keluar"
- Jika receiver disconnect → requester melihat "Lawan keluar"
- Rematch state di-reset untuk user yang masih online

---

## 📊 **STATE MACHINE**

```
┌──────────┐
│   IDLE   │ ← Initial state
└──────────┘
     │
     │ klik "MAIN LAGI"
     ▼
┌──────────────┐
│  REQUESTING  │ ← Menunggu lawan accept/cancel
└──────────────┘
     │
     ├─ lawan accept → ACCEPTED → restart game
     ├─ klik "BATALKAN" → IDLE
     └─ lawan disconnect → IDLE

┌──────────┐
│   IDLE   │
└──────────┘
     │
     │ lawan request
     ▼
┌──────────────┐
│  RECEIVING   │ ← Bisa accept tantangan
└──────────────┘
     │
     ├─ klik "TERIMA TANTANGAN" → ACCEPTED → restart game
     ├─ lawan cancel → IDLE
     └─ lawan disconnect → IDLE
```

---

## 🧪 **TESTING SCENARIOS**

### **Test 1: Normal Rematch Flow**
1. ✅ Game selesai
2. ✅ User A klik "MAIN LAGI" → "BATALKAN"
3. ✅ User B melihat "TERIMA TANTANGAN"
4. ✅ User B klik → countdown → game restart

### **Test 2: Reverse Flow**
1. ✅ Game selesai
2. ✅ User B klik "MAIN LAGI" → "BATALKAN"
3. ✅ User A melihat "TERIMA TANTANGAN"
4. ✅ User A klik → countdown → game restart

### **Test 3: Auto-Accept**
1. ✅ Game selesai
2. ✅ User A klik "MAIN LAGI"
3. ✅ User B klik "MAIN LAGI" (< 1 detik)
4. ✅ Auto-accept → countdown → game restart

### **Test 4: Cancel**
1. ✅ User A klik "MAIN LAGI" → "BATALKAN"
2. ✅ User A klik "BATALKAN" → "MAIN LAGI"
3. ✅ User B melihat "MAIN LAGI" (tantangan dibatalkan)

### **Test 5: Disconnect**
1. ✅ User A klik "MAIN LAGI" → "BATALKAN"
2. ✅ User A disconnect
3. ✅ User B melihat "Lawan keluar dari permainan"

---

## 🎨 **UI/UX IMPROVEMENTS**

### **Before (Old System):**
- ❌ Hanya satu arah (User A → User B)
- ❌ User B tidak bisa mengirim tantangan
- ❌ Tidak bisa cancel tantangan
- ❌ Button disabled saat menunggu

### **After (New System):**
- ✅ Bidirectional (kedua user bisa mengirim)
- ✅ Auto-accept jika klik bersamaan
- ✅ Bisa cancel dengan klik "BATALKAN"
- ✅ Button selalu enabled (lebih responsive)
- ✅ Warna button yang jelas (hijau/merah)

---

## 🚀 **DEPLOYMENT NOTES**

### **Breaking Changes:**
- ❌ **NONE** - Backward compatible dengan bot mode

### **New Dependencies:**
- ❌ **NONE** - Menggunakan Socket.IO yang sudah ada

### **Server Requirements:**
- ✅ Socket.IO 4.8.3+
- ✅ Node.js 18+
- ✅ Support untuk Set() data structure

---

## 📝 **CHANGELOG**

### **v1.1.0 - Bidirectional Rematch System**
- ✅ Added: Kedua user bisa mengirim tantangan
- ✅ Added: Auto-accept jika kedua user request bersamaan
- ✅ Added: Cancel tantangan dengan klik "BATALKAN"
- ✅ Improved: Button state yang lebih jelas (hijau/merah)
- ✅ Improved: Server-side rematch tracking dengan Set()
- ✅ Fixed: Disconnect cleanup untuk rematch state

---

## 🤝 **CONTRIBUTING**

Jika menemukan bug atau ingin menambahkan fitur:

1. Buat issue di GitHub
2. Fork repository
3. Buat branch baru: `git checkout -b feature/rematch-improvement`
4. Commit changes: `git commit -m "Add: rematch timeout feature"`
5. Push ke branch: `git push origin feature/rematch-improvement`
6. Buat Pull Request

---

## 📚 **REFERENCES**

- **Requirements Doc**: `.kiro/specs/bidirectional-rematch/requirements.md`
- **Socket.IO Docs**: https://socket.io/docs/v4/
- **React Hooks**: https://react.dev/reference/react

---

**Last Updated**: 2026-05-11  
**Version**: 1.1.0  
**Author**: TypeTug Development Team
