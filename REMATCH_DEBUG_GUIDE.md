# 🐛 Rematch Debug Guide

## ❌ **MASALAH YANG DILAPORKAN:**

User 1 (Azhar) klik "BATALKAN" tapi User 2 (Fasha) tidak melihat tombol "TERIMA TANTANGAN".

---

## 🔍 **DEBUGGING STEPS:**

### **1. Restart Server & Client**

```bash
# Terminal 1 - Stop dan restart server
Ctrl+C
npm start

# Terminal 2 - Stop dan restart client
Ctrl+C
npm run dev
```

### **2. Buka Browser Console**

**User 1 (Azhar):**
1. Buka browser console (F12)
2. Klik "MAIN LAGI"
3. Cek console log:
   ```
   📤 Sending rematch request
   ```

**User 2 (Fasha):**
1. Buka browser console (F12)
2. Tunggu User 1 klik "MAIN LAGI"
3. **HARUS MUNCUL** di console:
   ```
   🔔 Received rematchRequested event from opponent
   ```
4. **HARUS MUNCUL** tombol "TERIMA TANTANGAN"

### **3. Cek Server Console**

Setelah User 1 klik "MAIN LAGI", server console **HARUS MENAMPILKAN**:
```
📤 Player [socket-id] requested rematch in room [room-code]
   Current requests: 1/2
🔔 Notifying opponent in room [room-code]
```

---

## 🔧 **POSSIBLE ISSUES & SOLUTIONS:**

### **Issue 1: Event Listener Tidak Terdaftar**

**Symptom:** Console tidak menampilkan "🔔 Received rematchRequested event"

**Solution:**
```typescript
// Pastikan event listener terdaftar SEBELUM game selesai
useEffect(() => {
  if (isMultiplayer) {
    socket.on("rematchRequested", () => {
      console.log("🔔 Received rematchRequested event from opponent");
      setRematchReceived(true);
    });
  }
}, [isMultiplayer]);
```

---

### **Issue 2: Socket Tidak Terhubung**

**Symptom:** Server tidak menerima `requestRematch` event

**Check:**
```javascript
// Di browser console User 1
console.log("Socket connected:", socket.connected);
console.log("Socket ID:", socket.id);
console.log("Room:", kodeRoom);
```

**Solution:** Reconnect socket
```typescript
socket.disconnect();
socket.connect();
```

---

### **Issue 3: Room Code Tidak Match**

**Symptom:** Server log menampilkan "❌ Room [code] not found"

**Check:**
```javascript
// Di browser console kedua user
console.log("Room code:", kodeRoom);
```

**Solution:** Pastikan kedua user di room yang sama

---

### **Issue 4: State Tidak Update**

**Symptom:** Event diterima tapi button tidak berubah

**Check:**
```typescript
// Di browser console User 2
console.log("rematchReceived:", rematchReceived);
console.log("rematchRequested:", rematchRequested);
```

**Solution:** Force re-render
```typescript
setRematchReceived(prev => {
  console.log("Setting rematchReceived from", prev, "to true");
  return true;
});
```

---

## 🧪 **TESTING CHECKLIST:**

### **Test 1: Basic Rematch Flow**
- [ ] User 1 klik "MAIN LAGI"
- [ ] User 1 console: "📤 Sending rematch request"
- [ ] Server console: "📤 Player ... requested rematch"
- [ ] Server console: "🔔 Notifying opponent"
- [ ] User 2 console: "🔔 Received rematchRequested event"
- [ ] User 2 button: "TERIMA TANTANGAN" (hijau)

### **Test 2: Reverse Flow**
- [ ] User 2 klik "MAIN LAGI"
- [ ] User 2 console: "📤 Sending rematch request"
- [ ] Server console: "📤 Player ... requested rematch"
- [ ] Server console: "🔔 Notifying opponent"
- [ ] User 1 console: "🔔 Received rematchRequested event"
- [ ] User 1 button: "TERIMA TANTANGAN" (hijau)

### **Test 3: Auto-Accept**
- [ ] User 1 klik "MAIN LAGI"
- [ ] User 2 klik "MAIN LAGI" (< 1 detik)
- [ ] Server console: "✅ Both players requested rematch - AUTO ACCEPT"
- [ ] Kedua user: countdown muncul
- [ ] Game restart

---

## 📊 **EXPECTED CONSOLE OUTPUT:**

### **User 1 (Requester):**
```
📤 Sending rematch request
```

### **Server:**
```
📤 Player abc123 requested rematch in room ROOM01
   Current requests: 1/2
🔔 Notifying opponent in room ROOM01
```

### **User 2 (Receiver):**
```
🔔 Received rematchRequested event from opponent
```

---

## 🔍 **ADVANCED DEBUGGING:**

### **Check Socket.IO Connection:**
```javascript
// Di browser console
socket.on("connect", () => console.log("✅ Connected:", socket.id));
socket.on("disconnect", () => console.log("❌ Disconnected"));
socket.on("connect_error", (err) => console.log("❌ Error:", err));
```

### **Check Room Membership:**
```javascript
// Di server.js, tambahkan logging
console.log("Room players:", Object.keys(rooms[roomCode].players));
console.log("Socket rooms:", Array.from(socket.rooms));
```

### **Manual Event Test:**
```javascript
// Di browser console User 1
socket.emit("requestRematch", { roomCode: "ROOM01" });

// Di browser console User 2
socket.on("rematchRequested", () => console.log("✅ Event received!"));
```

---

## 🚨 **COMMON MISTAKES:**

### **1. Lupa Join Room**
```javascript
// WRONG - socket tidak join room
socket.emit("createRoom", { roomCode, playerName });

// RIGHT - socket harus join room
socket.emit("createRoom", { roomCode, playerName });
socket.join(roomCode); // Di server
```

### **2. Event Listener Terlambat**
```javascript
// WRONG - listener didaftarkan setelah event dikirim
socket.emit("requestRematch", { roomCode });
socket.on("rematchRequested", () => { ... }); // Terlambat!

// RIGHT - listener didaftarkan di useEffect
useEffect(() => {
  socket.on("rematchRequested", () => { ... });
}, []);
```

### **3. State Tidak Sinkron**
```javascript
// WRONG - state tidak update
const [rematchReceived, setRematchReceived] = useState(false);
socket.on("rematchRequested", () => {
  rematchReceived = true; // ❌ Tidak akan trigger re-render
});

// RIGHT - gunakan setState
socket.on("rematchRequested", () => {
  setRematchReceived(true); // ✅ Trigger re-render
});
```

---

## 🛠️ **QUICK FIXES:**

### **Fix 1: Hard Refresh**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **Fix 2: Clear Browser Cache**
```
F12 → Network tab → Disable cache
```

### **Fix 3: Restart Everything**
```bash
# Stop server
Ctrl+C

# Stop client
Ctrl+C

# Clear node_modules cache
npm cache clean --force

# Restart
npm start    # Terminal 1
npm run dev  # Terminal 2
```

---

## 📝 **REPORT BUG:**

Jika masih tidak work, report dengan informasi:

1. **Browser Console Log** (User 1 & User 2)
2. **Server Console Log**
3. **Screenshot** (kedua user)
4. **Steps to Reproduce**
5. **Expected vs Actual Behavior**

---

## ✅ **SUCCESS CRITERIA:**

Rematch system bekerja jika:
- ✅ User 1 klik "MAIN LAGI" → User 2 melihat "TERIMA TANTANGAN"
- ✅ User 2 klik "MAIN LAGI" → User 1 melihat "TERIMA TANTANGAN"
- ✅ Kedua user klik bersamaan → Auto-accept
- ✅ User bisa cancel dengan klik "BATALKAN"
- ✅ Console log muncul sesuai expected output

---

**Last Updated**: 2026-05-11  
**Version**: 1.1.0-debug
