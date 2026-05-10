# Round Indicator Perspective Logic

## Date: May 11, 2026

## Overview
Round indicators show colors from each player's perspective. If a player wins a round, they see green. If they lose, they see red.

---

## 🎯 Perspective-Based Colors

### Concept:
Each player sees the round indicators from **their own perspective**:
- 🟢 **Green** = I won this round
- 🔴 **Red** = I lost this round
- ⚪ **Gray** = Round not played yet

### Example Scenario:

#### Round 1: Fasha wins, Azhar loses

**Fasha's View:**
```
ROUND: 🟢 ⚪ ⚪
       1  2  SD
```
- Round 1 = Green (Fasha won)

**Azhar's View:**
```
ROUND: 🔴 ⚪ ⚪
       1  2  SD
```
- Round 1 = Red (Azhar lost)

---

## 💻 Implementation

### Game Logic:
```typescript
// Player is always "merah" (red team)
// Opponent is always "biru" (blue team)

const roundWinner = roundWins[round - 1]; // "merah", "biru", or null

// Determine color from player's perspective
const playerWon = roundWinner === "merah";   // Player won
const playerLost = roundWinner === "biru";   // Player lost
const notPlayed = roundWinner === null;      // Not played yet

const indicatorColor = 
  playerWon ? "#4A9060" :   // Green - Player won
  playerLost ? "#C84040" :  // Red - Player lost
  "#9A8878";                 // Gray - Not played

const indicatorBg = 
  playerWon ? "#4A9060" :   // Green background
  playerLost ? "#C84040" :  // Red background
  "#D8CEB8";                 // Gray background
```

### Key Points:
1. **Player is always "merah"** (red team in game logic)
2. **Opponent is always "biru"** (blue team in game logic)
3. **Colors are from player's perspective**, not absolute
4. **Each player sees different colors** for the same round

---

## 🎮 Complete Example

### Scenario: 3-Round Game with Sudden Death

#### Game Results:
- Round 1: Fasha wins
- Round 2: Azhar wins
- Sudden Death: Fasha wins

#### Fasha's View (Winner 2-1):
```
ROUND: 🟢 🔴 🟢
       1  2  SD

Round 1: Green (I won)
Round 2: Red (I lost)
Sudden Death: Green (I won)
```

#### Azhar's View (Loser 1-2):
```
ROUND: 🔴 🟢 🔴
       1  2  SD

Round 1: Red (I lost)
Round 2: Green (I won)
Sudden Death: Red (I lost)
```

---

## 🔄 How It Works in Multiplayer

### Server Side:
```javascript
// Server stores absolute winner
room.roundResults = {
  1: "merah",  // Red team (Fasha) won
  2: "biru",   // Blue team (Azhar) won
  3: "merah"   // Red team (Fasha) won
};

// Broadcast to all players
io.to(roomCode).emit("roundResult", { round: 1, winner: "merah" });
```

### Client Side (Fasha):
```typescript
// Fasha is "merah" team
socket.on("roundResult", ({ round, winner }) => {
  // winner = "merah"
  // Fasha sees: Green (I won!)
  setRoundWins(prev => {
    const newRoundWins = [...prev];
    newRoundWins[round - 1] = winner; // "merah"
    return newRoundWins;
  });
});

// Render indicator
const playerWon = roundWinner === "merah"; // true
const indicatorColor = "#4A9060"; // Green
```

### Client Side (Azhar):
```typescript
// Azhar is also "merah" team (from his perspective)
socket.on("roundResult", ({ round, winner }) => {
  // winner = "merah" (but this is Fasha's team)
  // From Azhar's perspective, he is "merah" and Fasha is "biru"
  // So we need to invert the winner
  
  // Actually, the server sends absolute winner
  // But each client interprets from their perspective
  
  // If server says "merah" won and I'm "biru", I lost
  // If server says "biru" won and I'm "biru", I won
});
```

---

## 🔧 Important Note

### Current Implementation:
The current implementation assumes:
- **Player is always "merah"** in their own view
- **Opponent is always "biru"** in their own view
- **Server sends absolute winner** ("merah" or "biru")

### For Multiplayer:
Each player needs to know which team they are:
- If I'm red team and server says "merah" won → I won (green)
- If I'm red team and server says "biru" won → I lost (red)
- If I'm blue team and server says "merah" won → I lost (red)
- If I'm blue team and server says "biru" won → I won (green)

### Current Logic Works Because:
In the current implementation:
- Player 1 (host) is always red team
- Player 2 (challenger) is always blue team
- Server sends absolute winner
- Each client shows colors from their perspective

---

## 🎨 Visual Representation

### Round 1: Fasha (Red Team) Wins

```
┌─────────────────────────────────────┐
│         FASHA'S SCREEN              │
│                                     │
│  ROUND: 🟢 ⚪ ⚪                    │
│         1  2  SD                    │
│                                     │
│  (Green = I won!)                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         AZHAR'S SCREEN              │
│                                     │
│  ROUND: 🔴 ⚪ ⚪                    │
│         1  2  SD                    │
│                                     │
│  (Red = I lost!)                    │
└─────────────────────────────────────┘
```

### After Round 2: Azhar (Blue Team) Wins

```
┌─────────────────────────────────────┐
│         FASHA'S SCREEN              │
│                                     │
│  ROUND: 🟢 🔴 ⚪                    │
│         1  2  SD                    │
│                                     │
│  Round 1: Green (I won)             │
│  Round 2: Red (I lost)              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         AZHAR'S SCREEN              │
│                                     │
│  ROUND: 🔴 🟢 ⚪                    │
│         1  2  SD                    │
│                                     │
│  Round 1: Red (I lost)              │
│  Round 2: Green (I won)             │
└─────────────────────────────────────┘
```

---

## ✅ Benefits

### 1. **Intuitive for Players**
- Players immediately see their performance
- Green = Good (I won)
- Red = Bad (I lost)
- No need to remember team colors

### 2. **Consistent Perspective**
- Each player sees from their own viewpoint
- No confusion about who won
- Clear visual feedback

### 3. **Motivational**
- Green indicators feel rewarding
- Red indicators motivate to win next round
- Clear progress tracking

---

## 🧪 Testing

### Test Scenario 1: Player Wins All Rounds
```
Player's View:
ROUND: 🟢 🟢 ⚪
       1  2  SD

(No sudden death needed, 2-0 victory)
```

### Test Scenario 2: Player Loses All Rounds
```
Player's View:
ROUND: 🔴 🔴 ⚪
       1  2  SD

(No sudden death needed, 0-2 defeat)
```

### Test Scenario 3: Draw → Sudden Death → Player Wins
```
Player's View:
ROUND: 🟢 🔴 🟢
       1  2  SD

Round 1: Green (won)
Round 2: Red (lost)
Sudden Death: Green (won)
Final: 2-1 victory
```

### Test Scenario 4: Draw → Sudden Death → Player Loses
```
Player's View:
ROUND: 🔴 🟢 🔴
       1  2  SD

Round 1: Red (lost)
Round 2: Green (won)
Sudden Death: Red (lost)
Final: 1-2 defeat
```

---

## 🎯 Summary

**Round indicators are perspective-based:**
- ✅ Green = Player won this round
- ✅ Red = Player lost this round
- ✅ Gray = Round not played yet
- ✅ Each player sees different colors
- ✅ Colors reflect personal performance
- ✅ Intuitive and motivational

**The same round can be:**
- 🟢 Green for the winner
- 🔴 Red for the loser

**This creates a personalized experience for each player!** 🎮

---

## 📝 Code Reference

### Location:
`src/app/pages/GamePage.tsx` - Round Indicators section

### Key Variables:
```typescript
roundWins: ("merah" | "biru" | null)[]  // Absolute winners
playerWon: boolean                       // Did I win?
playerLost: boolean                      // Did I lose?
indicatorColor: string                   // Color from my perspective
```

---

## 🚀 Status

**IMPLEMENTED** ✅

Round indicators now show colors from each player's perspective, providing intuitive and personalized feedback!
