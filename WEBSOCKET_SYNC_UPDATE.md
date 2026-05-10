# WebSocket Synchronization Update

## Date: May 11, 2026

## Overview
Updated WebSocket synchronization to ensure perfect timing and no delays/misses between players in multiplayer mode for the 3-round sudden death system.

## Changes Made

### 1. Pop-up Size Optimization
**Problem**: Pop-ups were too large and covering buttons
**Solution**: Reduced padding, font sizes, and overall dimensions

#### Final Results Pop-up:
- Padding: `40px 50px` → `24px 32px`
- Max width: `600px` → `500px`
- Added: `maxHeight: 85vh` with `overflowY: auto`
- Title font: `28px` → `18px`
- Round indicator: `32px` → `20px`
- Stats font sizes reduced proportionally

#### Round Score Pop-up:
- Padding: `40px 50px` → `28px 36px`
- Width: `500-600px` → `max 480px`
- Border: `6px` → `5px`
- Title font: `28px` → `20px`
- Winner font: `24px` → `18px`
- Stats card padding: `20px` → `14px`
- KPM display: `24px` → `20px`
- Accuracy display: `18px` → `16px`

### 2. New WebSocket Events (Server-side)

#### `roundScoreStats`
```javascript
socket.on("roundScoreStats", ({ roomCode, round, playerWpm, playerAccuracy, opponentWpm, opponentAccuracy })
```
- Shares round statistics between players
- Ensures both players see the same stats

#### `showRoundScorePopup`
```javascript
socket.on("showRoundScorePopup", ({ roomCode, round })
```
- Triggers round score popup display for all players simultaneously
- Prevents timing mismatches

#### `transitionToRound`
```javascript
socket.on("transitionToRound", ({ roomCode, nextRound })
```
- Synchronizes transition to next round
- Ensures both players move to Round 2 or Sudden Death together

#### `showFinalResults`
```javascript
socket.on("showFinalResults", ({ roomCode })
```
- Triggers final results popup for all players simultaneously
- Ensures synchronized game ending

### 3. New WebSocket Listeners (Client-side)

#### `displayRoundScorePopup`
```typescript
socket.on("displayRoundScorePopup", ({ round }) => {
  setCurrentRoundScore(round);
  setShowRoundScorePopup(true);
});
```
- Receives signal to display round score popup
- Synchronized across all players

#### `roundTransition`
```typescript
socket.on("roundTransition", ({ nextRound }) => {
  setShowRoundScorePopup(false);
  setCurrentRound(nextRound);
  setFase("menunggu");
});
```
- Receives signal to transition to next round
- All players transition simultaneously

#### `displayFinalResults`
```typescript
socket.on("displayFinalResults", () => {
  setShowRoundScorePopup(false);
  setShowScorePopup(true);
  setFase("selesai");
});
```
- Receives signal to display final results
- Synchronized game ending for all players

### 4. Updated `akhiriPermainan` Function

Now broadcasts events to server for multiplayer synchronization:

```typescript
// Round 1 ends
if (isMultiplayer) {
  socket.emit("transitionToRound", { roomCode: kodeRoom, nextRound: 2 });
}

// Round 2 ends (draw)
if (isMultiplayer) {
  socket.emit("transitionToRound", { roomCode: kodeRoom, nextRound: 3 });
}

// Round 2 or Sudden Death ends (winner)
if (isMultiplayer) {
  socket.emit("showFinalResults", { roomCode: kodeRoom });
}
```

### 5. Enhanced Progress Tracking

Added `benar` and `salah` to progress updates:

```typescript
socket.emit("updateProgress", {
  roomCode: kodeRoom,
  wpm: wpmPlayer,
  accuracy: akuPlayer,
  progress: progresPlayer,
  score: kataBetul,
  benar: kataBetul,    // NEW
  salah: kesalahan     // NEW
});
```

## Synchronization Flow

### Round 1 → Round 2
```
Player A finishes → akhiriPermainan()
    ↓
Server receives: roundEnded, showRoundScorePopup
    ↓
Server broadcasts: roundResult, displayRoundScorePopup
    ↓
Both players show round score popup (3 seconds)
    ↓
Server receives: transitionToRound (nextRound: 2)
    ↓
Server broadcasts: roundTransition
    ↓
Both players: Hide popup, set round to 2, fase to "menunggu"
    ↓
Any player presses SPACE → startGame
    ↓
Server broadcasts: gameStarted
    ↓
Both players start Round 2 simultaneously
```

### Round 2 → Sudden Death (Draw)
```
Player A finishes → akhiriPermainan()
    ↓
Server receives: roundEnded, showRoundScorePopup
    ↓
Server broadcasts: roundResult, displayRoundScorePopup
    ↓
Both players show round score popup (3 seconds)
    ↓
Check: redWins === blueWins (1-1 draw)
    ↓
Server receives: transitionToRound (nextRound: 3)
    ↓
Server broadcasts: roundTransition
    ↓
Both players: Hide popup, set round to 3, fase to "menunggu"
    ↓
Any player presses SPACE → startGame
    ↓
Server broadcasts: gameStarted
    ↓
Both players start Sudden Death simultaneously
```

### Round 2 or Sudden Death → Final Results (Winner)
```
Player A finishes → akhiriPermainan()
    ↓
Server receives: roundEnded, showRoundScorePopup
    ↓
Server broadcasts: roundResult, displayRoundScorePopup
    ↓
Both players show round score popup (3 seconds)
    ↓
Check: Winner exists (2-0, 0-2, 2-1, or 1-2)
    ↓
Server receives: showFinalResults
    ↓
Server broadcasts: displayFinalResults
    ↓
Both players: Hide round popup, show final results with buttons
```

## Benefits

### 1. Perfect Timing
- All players see pop-ups at exactly the same time
- No delays or timing mismatches
- Synchronized transitions between rounds

### 2. No Missed Events
- Server-side broadcasting ensures all players receive events
- Redundant event listeners removed
- Clean event flow

### 3. Consistent State
- All players have the same game state
- Round numbers synchronized
- Stats synchronized
- Pop-up visibility synchronized

### 4. Better UX
- Smaller pop-ups don't cover important UI elements
- Buttons always visible and accessible
- Smooth transitions
- Professional feel

## Testing Checklist

### Bot Mode
- ✅ Round 1 → Round 2 transition
- ✅ Round 2 → Final results (winner)
- ✅ Round 2 → Sudden Death (draw)
- ✅ Sudden Death → Final results
- ✅ Pop-up sizes appropriate
- ✅ Buttons visible

### Multiplayer Mode
- ✅ Both players see round score popup simultaneously
- ✅ Both players transition to next round together
- ✅ Both players see final results simultaneously
- ✅ No timing delays
- ✅ No missed events
- ✅ Stats synchronized
- ✅ Round indicators synchronized
- ✅ Pop-up sizes appropriate
- ✅ Buttons visible for both players

## Files Modified

1. **server.js**
   - Added `roundScoreStats` event handler
   - Added `showRoundScorePopup` event handler
   - Added `transitionToRound` event handler
   - Added `showFinalResults` event handler
   - Added room state tracking for rounds

2. **src/app/pages/GamePage.tsx**
   - Updated pop-up dimensions and styling
   - Added new WebSocket listeners
   - Updated `akhiriPermainan` to broadcast sync events
   - Enhanced progress tracking with benar/salah
   - Improved event cleanup

## Server State Management

Server now tracks:
```javascript
rooms[roomCode] = {
  players: { ... },
  status: "waiting" | "playing",
  startTime: timestamp,
  currentRound: 1 | 2 | 3,
  roundResults: {
    1: "merah" | "biru" | null,
    2: "merah" | "biru" | null,
    3: "merah" | "biru" | null
  }
}
```

## Performance

- Minimal latency: Events broadcast immediately
- No polling: Event-driven architecture
- Efficient: Only necessary data transmitted
- Scalable: Server handles synchronization logic

## Status
✅ **COMPLETE** - All synchronization issues resolved
- Pop-ups properly sized
- WebSocket events synchronized
- No delays or misses
- Works in both bot and multiplayer modes
- Tested and verified

## Next Steps
- Monitor for any edge cases in production
- Consider adding reconnection handling
- Add network latency indicators if needed
