# TypeTug Game Flow Guide

## Complete Game Flow with Sudden Death System

### 🎮 Game Start
```
┌─────────────────────────────────────┐
│  TEKAN SPASI UNTUK MULAI            │
│  (Press SPACE or click START)       │
└─────────────────────────────────────┘
```

---

## 📊 Round 1 Flow

### 1. Round Start
```
┌─────────────────────────────────────┐
│         🎯 ROUND 1 POP-UP           │
│         (1 second)                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         ⚔️ FIGHT! POP-UP            │
│         (1 second)                  │
└─────────────────────────────────────┘
              ↓
         GAME STARTS
```

### 2. Round 1 Ends
```
┌─────────────────────────────────────┐
│    📈 ROUND 1 SCORE POP-UP          │
│                                     │
│    Winner: [PLAYER NAME]            │
│                                     │
│    ┌──────────┐  ┌──────────┐      │
│    │ PLAYER   │  │ OPPONENT │      │
│    │ KPM: 85  │  │ KPM: 72  │      │
│    │ ACC: 95% │  │ ACC: 88% │      │
│    └──────────┘  └──────────┘      │
│                                     │
│    (3 seconds - NO BUTTONS)         │
└─────────────────────────────────────┘
              ↓
      AUTO CONTINUE TO ROUND 2
```

---

## 📊 Round 2 Flow

### 1. Round Start
```
┌─────────────────────────────────────┐
│         🎯 ROUND 2 POP-UP           │
│         (1 second)                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         ⚔️ FIGHT! POP-UP            │
│         (1 second)                  │
└─────────────────────────────────────┘
              ↓
         GAME STARTS
```

### 2. Round 2 Ends - TWO POSSIBLE PATHS

#### Path A: Clear Winner (2-0 or 0-2)
```
┌─────────────────────────────────────┐
│    📈 ROUND 2 SCORE POP-UP          │
│                                     │
│    Winner: [PLAYER NAME]            │
│                                     │
│    ┌──────────┐  ┌──────────┐      │
│    │ PLAYER   │  │ OPPONENT │      │
│    │ KPM: 88  │  │ KPM: 75  │      │
│    │ ACC: 96% │  │ ACC: 90% │      │
│    └──────────┘  └──────────┘      │
│                                     │
│    (3 seconds - NO BUTTONS)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    🏆 FINAL RESULTS POP-UP          │
│                                     │
│    HASIL PERTANDINGAN               │
│                                     │
│    Round 1: [Winner] ✓              │
│    Round 2: [Winner] ✓              │
│                                     │
│    PEMENANG FINAL                   │
│    🏆 [PLAYER NAME] 🏆              │
│    Score: 2 - 0                     │
│                                     │
│    [MAIN LAGI] [KEMBALI KE LOBI]    │
└─────────────────────────────────────┘
```

#### Path B: Draw (1-1) → Sudden Death
```
┌─────────────────────────────────────┐
│    📈 ROUND 2 SCORE POP-UP          │
│                                     │
│    Winner: [OPPONENT NAME]          │
│                                     │
│    ┌──────────┐  ┌──────────┐      │
│    │ PLAYER   │  │ OPPONENT │      │
│    │ KPM: 82  │  │ KPM: 87  │      │
│    │ ACC: 94% │  │ ACC: 92% │      │
│    └──────────┘  └──────────┘      │
│                                     │
│    (3 seconds - NO BUTTONS)         │
│    Score is 1-1 → DRAW!             │
└─────────────────────────────────────┘
              ↓
      AUTO CONTINUE TO SUDDEN DEATH
```

---

## ⚡ Sudden Death Flow (Only if 1-1 Draw)

### 1. Sudden Death Start
```
┌─────────────────────────────────────┐
│      💀 SUDDEN DEATH POP-UP         │
│         (1 second)                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         ⚔️ FIGHT! POP-UP            │
│         (1 second)                  │
└─────────────────────────────────────┘
              ↓
    SUDDEN DEATH GAME STARTS
```

### 2. Sudden Death Ends
```
┌─────────────────────────────────────┐
│    📈 SUDDEN DEATH SCORE POP-UP     │
│                                     │
│    Winner: [PLAYER NAME]            │
│                                     │
│    ┌──────────┐  ┌──────────┐      │
│    │ PLAYER   │  │ OPPONENT │      │
│    │ KPM: 90  │  │ KPM: 84  │      │
│    │ ACC: 97% │  │ ACC: 91% │      │
│    └──────────┘  └──────────┘      │
│                                     │
│    (3 seconds - NO BUTTONS)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    🏆 FINAL RESULTS POP-UP          │
│                                     │
│    HASIL PERTANDINGAN               │
│                                     │
│    Round 1: [Winner] ✓              │
│    Round 2: [Winner] ✓              │
│    Sudden Death: [Winner] ✓         │
│                                     │
│    PEMENANG FINAL                   │
│    🏆 [PLAYER NAME] 🏆              │
│    Score: 2 - 1                     │
│                                     │
│    [MAIN LAGI] [KEMBALI KE LOBI]    │
└─────────────────────────────────────┘
```

---

## 🎯 Round Indicators (Header)

```
ROUND: ⭕ ⭕ ⭕
       1  2  SD

Colors:
🟢 Green  = Player wins this round
🔴 Red    = Player loses this round  
⚪ Gray   = Not played yet
🟡 Gold Border = Current round
```

### Example Scenarios:

**After Round 1 (Player wins):**
```
ROUND: 🟢 ⚪ ⚪
       1  2  SD
```

**After Round 2 (Draw 1-1):**
```
ROUND: 🟢 🔴 ⚪
       1  2  SD
```

**After Sudden Death (Player wins 2-1):**
```
ROUND: 🟢 🔴 🟢
       1  2  SD
```

---

## 🎮 Control Summary

### During Game:
- **SPACE** = Type word / Start game
- **Type words** = Move rope position
- **Timer** = 60 seconds per round

### Between Rounds:
- **SPACE** or **START button** = Begin next round (any player in multiplayer)
- **Auto-transition** = 3 seconds after score pop-up

### After Game:
- **MAIN LAGI** = Play again (bot mode) or Request rematch (multiplayer)
- **TERIMA TANTANGAN** = Accept rematch (multiplayer)
- **KEMBALI KE LOBI** = Return to lobby

---

## 📝 Key Rules

1. ✅ **Round score pop-ups** = 3 seconds, NO buttons
2. ✅ **Final results pop-up** = Has buttons (MAIN LAGI, LOBI)
3. ✅ **Sudden Death** = Only if Round 2 ends 1-1
4. ✅ **Auto-transitions** = Between rounds (after 3-second score display)
5. ✅ **Manual start** = Any player can start next round in multiplayer
6. ✅ **Stats saved** = All rounds displayed in final results
7. ✅ **Blur effect** = Background blurred during all pop-ups

---

## 🏆 Winning Conditions

### 2-0 Victory
- Win Round 1 ✓
- Win Round 2 ✓
- **Result**: Instant victory, no Sudden Death

### 0-2 Defeat
- Lose Round 1 ✗
- Lose Round 2 ✗
- **Result**: Instant defeat, no Sudden Death

### 2-1 Victory (Sudden Death)
- Win Round 1 ✓
- Lose Round 2 ✗
- Win Sudden Death ✓
- **Result**: Victory after Sudden Death

### 1-2 Defeat (Sudden Death)
- Lose Round 1 ✗
- Win Round 2 ✓
- Lose Sudden Death ✗
- **Result**: Defeat after Sudden Death

---

## 🎨 Visual Style

All pop-ups feature:
- **Font**: Press Start 2P (retro pixel)
- **Background**: Parchment (#F4EDE0)
- **Borders**: Gold (#C08030) + Brown (#8C5A35)
- **Blur**: 4px on background gameplay
- **Animations**: fadeIn, popIn, shimmer
- **Decorative**: Corner elements on all pop-ups

---

## 🔄 Rematch System

### Bot Mode:
```
[MAIN LAGI] → Instant restart from Round 1
```

### Multiplayer Mode:
```
Player 1: [MAIN LAGI] → Sends rematch request
Player 2: [TERIMA TANTANGAN] → Accepts rematch
         → Both players restart from Round 1
```

---

## ✨ Summary

The game now features a complete 3-round system with:
- ✅ Per-round score displays with detailed stats
- ✅ Automatic progression between rounds
- ✅ Sudden Death for 1-1 draws
- ✅ Clear visual indicators for round status
- ✅ Comprehensive final results
- ✅ Smooth transitions and animations
- ✅ Multiplayer synchronization
- ✅ Intuitive button placement (only on final results)

**Status**: Fully implemented and ready for testing! 🎉
