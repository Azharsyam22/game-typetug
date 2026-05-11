# Requirements: Bidirectional Rematch System

## Introduction

Saat ini, sistem rematch di TypeTug hanya bekerja satu arah - hanya satu user yang bisa mengirim tantangan rematch, dan user lainnya hanya bisa menerima. Fitur ini akan mengubah sistem rematch menjadi **bidirectional** (dua arah), di mana **kedua user bisa saling menantang** dengan cara yang lebih fleksibel dan intuitif.

### Current Behavior (Masalah)
- User 1 klik "MAIN LAGI" → tombol jadi "MENUNGGU..."
- User 2 melihat "TERIMA TANTANGAN" → harus terima
- **Masalah**: User 2 tidak bisa mengirim tantangan balik jika dia yang ingin rematch duluan

### Desired Behavior (Solusi)
- **Siapa saja** yang klik "MAIN LAGI" duluan → mengirim tantangan
- User lainnya → melihat "TERIMA TANTANGAN"
- **Jika kedua user klik "MAIN LAGI" bersamaan** → langsung mulai game (auto-accept)

---

## Glossary

| Term | Definition |
|------|------------|
| **Rematch** | Permintaan untuk bermain lagi setelah game selesai |
| **Bidirectional** | Dua arah - kedua user bisa mengirim dan menerima tantangan |
| **Auto-accept** | Otomatis menerima tantangan jika kedua user request bersamaan |
| **Requester** | User yang mengirim tantangan rematch |
| **Receiver** | User yang menerima tantangan rematch |

---

## User Stories & Requirements

### Requirement 1: Flexible Rematch Initiation

**User Story:** Sebagai pemain, saya ingin bisa mengirim tantangan rematch terlebih dahulu, sehingga saya tidak perlu menunggu lawan mengirim tantangan.

#### Acceptance Criteria

1. **WHEN** game selesai dan score popup muncul, **THEN** kedua user melihat tombol "MAIN LAGI"
2. **WHEN** User A klik "MAIN LAGI" terlebih dahulu, **THEN**:
   - User A: tombol berubah jadi "MENUNGGU..." (disabled)
   - User B: tombol berubah jadi "TERIMA TANTANGAN" (enabled)
3. **WHEN** User B klik "TERIMA TANTANGAN", **THEN** game restart untuk kedua user
4. **WHEN** User B klik "MAIN LAGI" sebelum User A, **THEN**:
   - User B: tombol berubah jadi "MENUNGGU..." (disabled)
   - User A: tombol berubah jadi "TERIMA TANTANGAN" (enabled)

#### Correctness Properties

**Property 1.1**: Hanya satu user yang bisa menjadi requester pada satu waktu
```
∀ room, time: 
  (user1.isRequester(time) ∧ user2.isRequester(time)) = false
```

**Property 1.2**: Jika user A adalah requester, maka user B adalah receiver
```
∀ room, time:
  userA.isRequester(time) → userB.isReceiver(time)
```

---

### Requirement 2: Simultaneous Request Handling (Auto-Accept)

**User Story:** Sebagai pemain, jika saya dan lawan sama-sama klik "MAIN LAGI" hampir bersamaan, saya ingin game langsung dimulai tanpa perlu konfirmasi tambahan.

#### Acceptance Criteria

1. **WHEN** User A klik "MAIN LAGI" dan User B juga klik "MAIN LAGI" dalam waktu < 1 detik, **THEN** game langsung restart tanpa perlu konfirmasi
2. **WHEN** kedua user request bersamaan, **THEN** tidak ada yang melihat "TERIMA TANTANGAN" - langsung countdown
3. **WHEN** auto-accept terjadi, **THEN** kedua user melihat countdown 3-2-1-FIGHT secara sinkron

#### Correctness Properties

**Property 2.1**: Jika kedua user request dalam window waktu yang sama, game harus restart
```
∀ room:
  (user1.requestTime - user2.requestTime) < 1000ms →
    gameState = "countdown"
```

**Property 2.2**: Auto-accept tidak boleh terjadi jika salah satu user sudah cancel
```
∀ room:
  (user1.cancelled ∨ user2.cancelled) →
    autoAccept = false
```

---

### Requirement 3: Request Cancellation

**User Story:** Sebagai pemain yang sudah mengirim tantangan rematch, saya ingin bisa membatalkan tantangan jika saya berubah pikiran.

#### Acceptance Criteria

1. **WHEN** user sudah klik "MAIN LAGI" (status: MENUNGGU...), **THEN** user bisa klik tombol lagi untuk cancel
2. **WHEN** user cancel tantangan, **THEN**:
   - User yang cancel: tombol kembali ke "MAIN LAGI"
   - User lawan: tombol kembali ke "MAIN LAGI" (jika sempat berubah)
3. **WHEN** user cancel, **THEN** notifikasi muncul di lawan: "Lawan membatalkan tantangan"

#### Correctness Properties

**Property 3.1**: Cancel hanya bisa dilakukan oleh requester
```
∀ user, room:
  user.canCancel() ↔ user.isRequester()
```

**Property 3.2**: Setelah cancel, kedua user kembali ke state awal
```
∀ room:
  cancel() →
    (user1.state = "idle" ∧ user2.state = "idle")
```

---

### Requirement 4: Visual Feedback & State Synchronization

**User Story:** Sebagai pemain, saya ingin melihat status rematch dengan jelas sehingga saya tahu apa yang sedang terjadi.

#### Acceptance Criteria

1. **WHEN** user mengirim tantangan, **THEN** tombol berubah warna menjadi abu-abu (#A89878) dengan text "MENUNGGU..."
2. **WHEN** user menerima tantangan, **THEN** tombol berubah warna menjadi hijau (#4A9060) dengan text "TERIMA TANTANGAN"
3. **WHEN** lawan keluar dari room, **THEN** tombol rematch hilang dan hanya ada "KEMBALI KE LOBI"
4. **WHEN** rematch accepted, **THEN** score popup tertutup dan countdown dimulai dalam 500ms

#### Correctness Properties

**Property 4.1**: Button state harus sinkron dengan rematch state
```
∀ user:
  user.isRequester() → button.text = "MENUNGGU..." ∧ button.disabled = true
  user.isReceiver() → button.text = "TERIMA TANTANGAN" ∧ button.disabled = false
  user.isIdle() → button.text = "MAIN LAGI" ∧ button.disabled = false
```

**Property 4.2**: Kedua user harus melihat state yang konsisten
```
∀ room, time:
  user1.viewState(time) = inverse(user2.viewState(time))
```

---

### Requirement 5: Network Resilience

**User Story:** Sebagai pemain, jika koneksi saya terputus saat rematch, saya ingin sistem menangani dengan baik tanpa stuck.

#### Acceptance Criteria

1. **WHEN** requester disconnect sebelum receiver accept, **THEN** receiver melihat "Lawan keluar dari permainan"
2. **WHEN** receiver disconnect sebelum accept, **THEN** requester melihat "Lawan keluar dari permainan"
3. **WHEN** disconnect terjadi, **THEN** rematch state di-reset untuk user yang masih online
4. **WHEN** user reconnect setelah disconnect, **THEN** user kembali ke lobby (tidak auto-rejoin game)

#### Correctness Properties

**Property 5.1**: Disconnect harus membersihkan rematch state
```
∀ user, room:
  user.disconnect() →
    room.rematchState = null ∧
    opponent.rematchState = "idle"
```

**Property 5.2**: Tidak boleh ada orphaned rematch requests
```
∀ room:
  (user1.disconnected ∨ user2.disconnected) →
    room.pendingRematch = null
```

---

## Non-Functional Requirements

### Performance
- Rematch request harus terkirim dalam < 100ms
- Auto-accept detection harus terjadi dalam < 50ms
- State synchronization harus real-time (< 200ms latency)

### Usability
- Button state harus jelas dan mudah dipahami
- Tidak ada ambiguitas tentang siapa yang mengirim/menerima tantangan
- Feedback visual harus instant (< 100ms)

### Reliability
- Rematch system harus bekerja 99.9% dari waktu
- Tidak boleh ada race condition yang menyebabkan stuck state
- Disconnect harus ditangani dengan graceful degradation

---

## Technical Constraints

1. **WebSocket Events**: Menggunakan Socket.IO untuk real-time communication
2. **State Management**: React useState hooks untuk local state
3. **Synchronization**: Server sebagai source of truth untuk rematch state
4. **Backward Compatibility**: Tidak boleh break existing bot mode rematch

---

## Success Metrics

1. **Functional**: 100% test cases pass untuk semua scenarios
2. **User Experience**: Rematch success rate > 95%
3. **Performance**: Average rematch latency < 200ms
4. **Reliability**: Zero stuck states dalam 1000 rematch attempts

---

## Out of Scope

- Rematch dengan lebih dari 2 players (future: tournament mode)
- Rematch history/statistics
- Rematch dengan different game settings (WPM bot, kata pool, dll)
- Rematch timeout (auto-cancel setelah X detik)

---

## Dependencies

- Socket.IO server harus support room-based events
- Client harus maintain WebSocket connection
- Server harus track rematch state per room

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Race condition saat simultaneous request | High | Medium | Server-side locking mechanism |
| Network latency menyebabkan delayed state update | Medium | High | Optimistic UI updates + rollback |
| User spam klik tombol rematch | Low | Medium | Debounce button clicks |
| Disconnect saat rematch process | Medium | Low | Cleanup handlers + timeout |

---

## Acceptance Testing Scenarios

### Scenario 1: Normal Rematch Flow
1. Game selesai → kedua user di score popup
2. User A klik "MAIN LAGI" → User A: "MENUNGGU...", User B: "TERIMA TANTANGAN"
3. User B klik "TERIMA TANTANGAN" → countdown → game restart

### Scenario 2: Reverse Rematch Flow
1. Game selesai → kedua user di score popup
2. User B klik "MAIN LAGI" → User B: "MENUNGGU...", User A: "TERIMA TANTANGAN"
3. User A klik "TERIMA TANTANGAN" → countdown → game restart

### Scenario 3: Simultaneous Request (Auto-Accept)
1. Game selesai → kedua user di score popup
2. User A dan User B klik "MAIN LAGI" bersamaan (< 1s)
3. Kedua user langsung melihat countdown → game restart

### Scenario 4: Request Cancellation
1. User A klik "MAIN LAGI" → "MENUNGGU..."
2. User A klik lagi untuk cancel → kembali ke "MAIN LAGI"
3. User B melihat notifikasi "Lawan membatalkan tantangan"

### Scenario 5: Disconnect During Rematch
1. User A klik "MAIN LAGI" → "MENUNGGU..."
2. User A disconnect
3. User B melihat "Lawan keluar dari permainan"
4. User B hanya bisa klik "KEMBALI KE LOBI"

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-11  
**Status**: Draft - Ready for Review
