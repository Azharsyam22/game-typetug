# Room Not Found Pop-up Implementation

## Date: May 11, 2026

## Overview
Implemented a professional error pop-up that appears when a player tries to join a room that doesn't exist or is no longer active.

---

## 🎯 Features

### 1. **Error Detection**
- Detects when room code is invalid
- Detects when room doesn't exist
- Detects when room is no longer active

### 2. **Visual Design**
- ✅ Retro pixel art style matching game theme
- ✅ Red color scheme for error state
- ✅ Large error icon (✗) in circular badge
- ✅ Blur effect on background (6px)
- ✅ Decorative corner elements
- ✅ Shadow effects for depth

### 3. **Information Display**
- ✅ Clear error title: "ROOM TIDAK DITEMUKAN"
- ✅ Subtitle: "KODE ROOM TIDAK VALID"
- ✅ Shows the entered room code in large text
- ✅ Helpful error message with checklist:
  - Kode room benar
  - Room masih aktif
  - Host belum menutup room

### 4. **User Actions**
- ✅ "MENGERTI" button to close popup
- ✅ Click outside to close
- ✅ Automatically clears invalid room code
- ✅ Returns focus to room code input

---

## 🔄 Flow

### User Journey:
```
1. User enters room code in lobby
2. User clicks "GABUNG" button
3. Client navigates to GamePage
4. Client attempts to join room via WebSocket
5. Server checks if room exists
6. If room NOT found:
   ↓
   Server emits "joinError" event
   ↓
   Client receives error
   ↓
   Client navigates back to lobby with error state
   ↓
   Lobby detects error state
   ↓
   Pop-up appears with room code
   ↓
   User reads error message
   ↓
   User clicks "MENGERTI" or clicks outside
   ↓
   Pop-up closes
   ↓
   Room code input is cleared
   ↓
   User can try again
```

---

## 💻 Implementation

### 1. LobbyPage.tsx

#### State Management:
```typescript
const [showRoomNotFoundPopup, setShowRoomNotFoundPopup] = useState(false);
const [roomNotFoundCode, setRoomNotFoundCode] = useState("");
```

#### Error Detection:
```typescript
useEffect(() => {
  const state = location.state as { roomNotFound?: boolean; roomCode?: string } | null;
  if (state?.roomNotFound && state?.roomCode) {
    setRoomNotFoundCode(state.roomCode);
    setShowRoomNotFoundPopup(true);
    // Clear the state
    window.history.replaceState({}, document.title);
  }
}, [location]);
```

#### Pop-up UI:
```typescript
{showRoomNotFoundPopup && (
  <div style={{ /* overlay styles */ }}>
    <div style={{ /* popup card styles */ }}>
      {/* Error icon */}
      {/* Title */}
      {/* Room code display */}
      {/* Error message */}
      {/* Close button */}
    </div>
  </div>
)}
```

### 2. GamePage.tsx

#### Error Handling:
```typescript
socket.on("joinError", (err) => {
  console.log("Join error:", err);
  // Redirect back to lobby with error state
  navigate("/lobby", { 
    state: { 
      roomNotFound: true, 
      roomCode: kodeRoom 
    } 
  });
});
```

### 3. server.js

#### Room Validation:
```javascript
socket.on("joinRoom", ({ roomCode, playerName }) => {
  const room = rooms[roomCode];
  if (room) {
    // Room exists, allow join
    // ...
  } else {
    // Room doesn't exist, send error
    socket.emit("joinError", "Ruangan tidak ditemukan!");
  }
});
```

---

## 🎨 Visual Design

### Color Scheme:
- **Background Overlay**: `rgba(42, 26, 24, 0.7)` with 6px blur
- **Card Background**: `#FDFAF4` (parchment)
- **Border**: `#C84040` (red) 4px solid
- **Shadow**: `8px 8px 0 rgba(0,0,0,0.3)`
- **Corners**: `#C84040` with `#8C5A35` border

### Typography:
- **Font**: "Press Start 2P" (retro pixel)
- **Title**: 18px, red, letter-spacing 2px
- **Subtitle**: 9px, gray, letter-spacing 1px
- **Room Code**: 24px, red, letter-spacing 6px
- **Message**: 8px, gray, line-height 1.6

### Layout:
```
┌─────────────────────────────────┐
│         [Error Icon ✗]          │
│    ROOM TIDAK DITEMUKAN         │
│    KODE ROOM TIDAK VALID        │
│                                 │
│  ┌───────────────────────────┐  │
│  │ KODE YANG ANDA MASUKKAN:  │  │
│  │      ABC123               │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ ⚠️ Room dengan kode...    │  │
│  │                           │  │
│  │ Pastikan:                 │  │
│  │ • Kode room benar         │  │
│  │ • Room masih aktif        │  │
│  │ • Host belum menutup room │  │
│  └───────────────────────────┘  │
│                                 │
│     [✓ MENGERTI]                │
└─────────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### Scenario 1: Invalid Room Code
1. Enter non-existent room code (e.g., "XXXXXX")
2. Click "GABUNG"
3. ✅ Pop-up appears with error message
4. ✅ Shows entered code "XXXXXX"
5. Click "MENGERTI"
6. ✅ Pop-up closes
7. ✅ Room code input is cleared

### Scenario 2: Room No Longer Active
1. Enter valid room code
2. Host closes room before you join
3. Click "GABUNG"
4. ✅ Pop-up appears with error message
5. ✅ Shows entered code
6. Click outside popup
7. ✅ Pop-up closes
8. ✅ Room code input is cleared

### Scenario 3: Typo in Room Code
1. Enter room code with typo (e.g., "ABC12" instead of "ABC123")
2. Click "GABUNG"
3. ✅ Pop-up appears
4. ✅ User sees the typo in large text
5. Click "MENGERTI"
6. ✅ Can correct the typo and try again

---

## 🎯 User Experience Benefits

### 1. **Clear Feedback**
- User immediately knows what went wrong
- No confusion about why join failed

### 2. **Helpful Information**
- Shows exactly what code was entered
- Provides checklist of possible issues
- Suggests what to verify

### 3. **Professional Polish**
- Matches game's retro aesthetic
- Smooth animations
- Consistent with other UI elements

### 4. **Easy Recovery**
- Simple close action
- Automatically clears invalid code
- User can immediately try again

---

## 📊 Error Messages

### Current Messages:
1. **Title**: "ROOM TIDAK DITEMUKAN"
2. **Subtitle**: "KODE ROOM TIDAK VALID"
3. **Body**: 
   ```
   ⚠️ Room dengan kode tersebut tidak ditemukan atau sudah tidak aktif.
   
   Pastikan:
   • Kode room benar
   • Room masih aktif
   • Host belum menutup room
   ```

### Future Enhancements (Optional):
- Different messages for different error types
- Suggestion to create new room
- Recent rooms list
- Copy room code button

---

## 🔧 Technical Details

### State Flow:
```
LobbyPage → GamePage → Server → GamePage → LobbyPage
    ↓          ↓          ↓          ↓          ↓
  Input    Navigate   Check     Error    Show Popup
   Code      /game    Room     Event      + Code
```

### WebSocket Events:
- **Client → Server**: `joinRoom({ roomCode, playerName })`
- **Server → Client**: `joinError("Ruangan tidak ditemukan!")`

### Navigation State:
```typescript
navigate("/lobby", { 
  state: { 
    roomNotFound: true,  // Flag for error
    roomCode: kodeRoom   // Code that failed
  } 
});
```

---

## ✅ Checklist

- ✅ Pop-up design matches game theme
- ✅ Error detection works
- ✅ Shows entered room code
- ✅ Helpful error message
- ✅ Close button works
- ✅ Click outside to close works
- ✅ Clears invalid code
- ✅ Smooth animations
- ✅ Blur effect on background
- ✅ Responsive design
- ✅ Accessible (keyboard support)

---

## 🎉 Result

**Professional error handling with clear user feedback!**

Users now get:
- ✅ Immediate error notification
- ✅ Clear explanation of what went wrong
- ✅ Visual confirmation of entered code
- ✅ Helpful troubleshooting tips
- ✅ Easy way to try again

**No more confusion about why room join failed!** 🚀

---

## 📝 Files Modified

1. **src/app/pages/LobbyPage.tsx**
   - Added state for popup
   - Added error detection from navigation state
   - Added popup UI component
   - Added close handlers

2. **src/app/pages/GamePage.tsx**
   - Updated joinError handler
   - Navigate back to lobby with error state
   - Pass room code in state

3. **server.js**
   - Already has room validation
   - Emits joinError when room not found

---

## 🚀 Status

**COMPLETE** ✅

Room not found error handling is now fully implemented with professional UI and clear user feedback!
