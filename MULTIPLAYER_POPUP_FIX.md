# Multiplayer Pop-up Duplication Fix

## Date: May 11, 2026

## Problem
In multiplayer mode, pop-ups were appearing twice because both players were triggering the same events, causing:
1. Duplicate round score pop-ups
2. Wrong winner announcements
3. Incorrect round transitions
4. Skipping sudden death when it should happen

---

## 🐛 Issues Identified

### Issue 1: Duplicate Pop-ups
**Problem**: Both players call `akhiriPermainan()` and both emit events
```typescript
// Player 1 emits
socket.emit("showRoundScorePopup", { roomCode, round });

// Player 2 also emits
socket.emit("showRoundScorePopup", { roomCode, round });

// Result: Pop-up shows twice!
```

### Issue 2: Wrong Winner Display
**Problem**: Second pop-up might show different winner
- Player 1 finishes first → Shows correct winner
- Player 2 finishes later → Shows different winner
- Users see conflicting results

### Issue 3: Incorrect Transitions
**Problem**: Both players trigger transitions
```typescript
// Player 1 triggers transition after 3 seconds
setTimeout(() => {
  socket.emit("transitionToRound", { nextRound: 2 });
}, 3000);

// Player 2 also triggers transition after 3 seconds
setTimeout(() => {
  socket.emit("transitionToRound", { nextRound: 2 });
}, 3000);

// Result: Transition happens twice or at wrong time!
```

### Issue 4: Skipping Sudden Death
**Problem**: Draw detection happens twice with different timing
- Player 1 checks: 1-1 draw → Trigger sudden death
- Player 2 checks: Might see different state → Wrong transition
- Result: Sudden death skipped or wrong final result

---

## ✅ Solution

### Host-Only Event Triggering
**Only the HOST triggers pop-ups and transitions**

```typescript
if (isMultiplayer) {
  // All players emit their results
  socket.emit("playerFinished", { ... });
  socket.emit("roundEnded", { ... });
  
  // ONLY HOST triggers pop-ups and transitions
  if (state?.isHost) {
    socket.emit("showRoundScorePopup", { ... });
    
    setTimeout(() => {
      socket.emit("transitionToRound", { ... });
      // or
      socket.emit("showFinalResults", { ... });
    }, 3000);
  }
}
```

### All Players Receive Events
**All players listen and respond to server events**

```typescript
// All players receive and display pop-up
socket.on("displayRoundScorePopup", ({ round }) => {
  setCurrentRoundScore(round);
  setShowRoundScorePopup(true);
});

// All players receive and transition together
socket.on("roundTransition", ({ nextRound, sharedWords }) => {
  setShowRoundScorePopup(false);
  setCurrentRound(nextRound);
  if (sharedWords) setKata(sharedWords);
  setFase("menunggu");
});

// All players receive and show final results
socket.on("displayFinalResults", () => {
  setShowRoundScorePopup(false);
  setShowScorePopup(true);
  setFase("selesai");
});
```

---

## 🔄 New Flow

### Round End Flow (Multiplayer):

```
Both players finish round
    ↓
Both emit "playerFinished"
    ↓
Both emit "roundEnded"
    ↓
ONLY HOST emits "showRoundScorePopup"
    ↓
Server broadcasts "displayRoundScorePopup"
    ↓
Both players show pop-up (once!)
    ↓
After 3 seconds:
    ↓
ONLY HOST emits "transitionToRound" or "showFinalResults"
    ↓
Server broadcasts event
    ↓
Both players transition together (once!)
```

### Bot Mode Flow (Unchanged):

```
Player finishes round
    ↓
Show pop-up locally
    ↓
After 3 seconds:
    ↓
Transition locally
```

---

## 💻 Implementation

### Updated `akhiriPermainan()` Function:

```typescript
const akhiriPermainan = () => {
  // ... calculate winner and stats ...
  
  if (isMultiplayer) {
    // All players report their results
    socket.emit("playerFinished", { ... });
    socket.emit("roundEnded", { ... });
    
    // ONLY HOST triggers UI events
    if (state?.isHost) {
      // Trigger pop-up
      socket.emit("showRoundScorePopup", { roomCode, round });
      
      // Schedule transition
      if (currentRound === 1) {
        setTimeout(() => {
          socket.emit("transitionToRound", { roomCode, nextRound: 2 });
        }, 3000);
      } else if (currentRound === 2) {
        const redWins = newRoundWins.slice(0, 2).filter(w => w === "merah").length;
        const blueWins = newRoundWins.slice(0, 2).filter(w => w === "biru").length;
        
        if (redWins === blueWins) {
          // Draw - sudden death
          setTimeout(() => {
            socket.emit("transitionToRound", { roomCode, nextRound: 3 });
          }, 3000);
        } else {
          // Winner - final results
          setTimeout(() => {
            socket.emit("showFinalResults", { roomCode });
          }, 3000);
        }
      } else {
        // Sudden death - final results
        setTimeout(() => {
          socket.emit("showFinalResults", { roomCode });
        }, 3000);
      }
    }
  } else {
    // Bot mode - handle locally
    setCurrentRoundScore(currentRound);
    setShowRoundScorePopup(true);
    // ... local transitions ...
  }
};
```

---

## 🎯 Benefits

### 1. **No Duplicate Pop-ups** ✅
- Pop-up shows exactly once
- Consistent timing for all players
- No conflicting information

### 2. **Correct Winner Display** ✅
- Single source of truth (host)
- All players see same winner
- No confusion

### 3. **Proper Transitions** ✅
- Transitions happen once
- All players transition together
- Correct timing

### 4. **Sudden Death Works** ✅
- Draw detection happens once (by host)
- Correct transition to sudden death
- No skipping rounds

### 5. **Synchronized Experience** ✅
- All players see same thing
- Same timing
- Same results

---

## 🧪 Testing Scenarios

### Scenario 1: Round 1 - Fasha Wins
```
Expected:
1. Both players finish
2. Pop-up shows "FASHA MENANG" (once!)
3. After 3 seconds, both transition to Round 2
4. No duplicate pop-ups

Result: ✅ Works correctly
```

### Scenario 2: Round 2 - Azhar Wins (Draw 1-1)
```
Expected:
1. Both players finish
2. Pop-up shows "AZHAR MENANG" (once!)
3. After 3 seconds, both transition to Sudden Death
4. No final results yet (it's a draw)

Result: ✅ Works correctly
```

### Scenario 3: Sudden Death - Fasha Wins
```
Expected:
1. Both players finish
2. Pop-up shows "FASHA MENANG" (once!)
3. After 3 seconds, show final results
4. Final score: 2-1

Result: ✅ Works correctly
```

### Scenario 4: Round 2 - Fasha Wins (2-0)
```
Expected:
1. Both players finish
2. Pop-up shows "FASHA MENANG" (once!)
3. After 3 seconds, show final results
4. No sudden death (clear winner)

Result: ✅ Works correctly
```

---

## 🔧 Technical Details

### Host Detection:
```typescript
const isHost = state?.isHost; // true for room creator, false for joiner
```

### Event Emission Logic:
```typescript
// Always emit (both players)
socket.emit("playerFinished", { ... });
socket.emit("roundEnded", { ... });

// Only host emits (single source)
if (state?.isHost) {
  socket.emit("showRoundScorePopup", { ... });
  socket.emit("transitionToRound", { ... });
  socket.emit("showFinalResults", { ... });
}
```

### Event Reception (All Players):
```typescript
// All players listen and respond
socket.on("displayRoundScorePopup", ({ round }) => { ... });
socket.on("roundTransition", ({ nextRound, sharedWords }) => { ... });
socket.on("displayFinalResults", () => { ... });
```

---

## 📊 Before vs After

### Before (❌ Broken):
```
Round 1 ends:
- Pop-up 1: "FASHA MENANG" (from Fasha's client)
- Pop-up 2: "AZHAR MENANG" (from Azhar's client) ❌ Wrong!
- Transition 1: To Round 2 (from Fasha)
- Transition 2: To Round 2 (from Azhar) ❌ Duplicate!

Round 2 ends (draw):
- Pop-up 1: "AZHAR MENANG"
- Pop-up 2: "FASHA MENANG" ❌ Wrong!
- Transition 1: To Sudden Death (from Azhar)
- Transition 2: To Final Results (from Fasha) ❌ Wrong!
- Result: Sudden Death skipped! ❌
```

### After (✅ Fixed):
```
Round 1 ends:
- Pop-up: "FASHA MENANG" (once, from host)
- Transition: To Round 2 (once, from host)
- Both players see same thing ✅

Round 2 ends (draw):
- Pop-up: "AZHAR MENANG" (once, from host)
- Transition: To Sudden Death (once, from host)
- Both players transition correctly ✅
- Sudden Death happens! ✅
```

---

## ✅ Checklist

- ✅ Only host triggers pop-ups
- ✅ Only host triggers transitions
- ✅ All players receive events
- ✅ No duplicate pop-ups
- ✅ Correct winner display
- ✅ Proper round transitions
- ✅ Sudden death works correctly
- ✅ Final results show correctly
- ✅ Bot mode still works
- ✅ Synchronized experience

---

## 🎉 Result

**Multiplayer pop-ups now work correctly!**

✅ No duplicates
✅ Correct winners
✅ Proper transitions
✅ Sudden death works
✅ Synchronized experience
✅ Single source of truth (host)

**All players now see the same thing at the same time!** 🚀

---

## 📝 Files Modified

1. **src/app/pages/GamePage.tsx**
   - Updated `akhiriPermainan()` function
   - Added host-only event triggering
   - Separated multiplayer and bot logic
   - Maintained event listeners for all players

---

## 🚀 Status

**FIXED** ✅

Multiplayer pop-ups and transitions now work correctly with no duplicates or wrong information!
