import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

// ─── Utilities ─────────────────────────────────────────────────────────────────
function kodeRandom() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type ModeAktif = "bot" | "buat" | "gabung";
type TingkatBot = "mudah" | "sedang" | "susah";

const WPM_TINGKAT: Record<TingkatBot, number> = { mudah: 30, sedang: 50, susah: 75 };
const KPM_LABEL: Record<TingkatBot, string> = { mudah: "~30 KPM", sedang: "~50 KPM", susah: "~75 KPM" };

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LobbyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nama, setNama] = useState(() => (user?.username || user?.email || "").toUpperCase().slice(0, 12));
  const [modeAktif, setModeAktif] = useState<ModeAktif>("bot");
  const [tingkat, setTingkat] = useState<TingkatBot>("mudah");
  const [kodeInput, setKodeInput] = useState("");
  const [kodeGenerated] = useState(kodeRandom);
  const [error, setError] = useState("");
  const [showRoomNotFoundPopup, setShowRoomNotFoundPopup] = useState(false);
  const [roomNotFoundCode, setRoomNotFoundCode] = useState("");
  const [fokusNama, setFokusNama] = useState(false);
  const [fokusKode, setFokusKode] = useState(false);
  const namaRef = useRef<HTMLInputElement>(null);

  useEffect(() => { namaRef.current?.focus(); }, []);

  const navigateGame = (mode: ModeAktif) => {
    if (!nama.trim()) { setError("Masukkan nama pemain!"); namaRef.current?.focus(); return; }
    if (nama.trim().length < 2) { setError("Nama minimal 2 karakter!"); return; }
    if (mode === "gabung" && kodeInput.length < 4) {
      setError("Masukkan kode ruangan (min. 4 karakter)!"); return;
    }
    setError("");
    
    const kode =
      mode === "bot" ? "------" :
      mode === "gabung" ? kodeInput.toUpperCase() :
      kodeGenerated;
    
    // Jika mode gabung, validasi room dulu via WebSocket sebelum navigate
    if (mode === "gabung") {
      validateAndJoinRoom(kode);
      return;
    }
    
    // Mode bot atau buat room langsung navigate
    navigate("/permainan", {
      state: {
        nama: nama.trim(),
        kodeRoom: kode,
        isHost: mode !== "gabung",
        modePerm: mode === "bot" ? "bot" : "multiplayer",
        wpmBot: WPM_TINGKAT[tingkat],
      },
    });
  };

  const validateAndJoinRoom = (roomCode: string) => {
    // Import socket untuk validasi
    import("../../socket").then(({ socket }) => {
      socket.connect();
      
      // Set timeout untuk validasi
      const validationTimeout = setTimeout(() => {
        socket.disconnect();
        setRoomNotFoundCode(roomCode);
        setShowRoomNotFoundPopup(true);
      }, 3000);
      
      // Listen untuk room ready (room exists)
      const handleRoomReady = () => {
        clearTimeout(validationTimeout);
        socket.off("roomReady", handleRoomReady);
        socket.off("joinError", handleJoinError);
        socket.disconnect();
        
        // Room valid, navigate ke game
        navigate("/permainan", {
          state: {
            nama: nama.trim(),
            kodeRoom: roomCode,
            isHost: false,
            modePerm: "multiplayer",
            wpmBot: WPM_TINGKAT[tingkat],
          },
        });
      };
      
      // Listen untuk join error (room not found)
      const handleJoinError = (err: string) => {
        clearTimeout(validationTimeout);
        socket.off("roomReady", handleRoomReady);
        socket.off("joinError", handleJoinError);
        socket.disconnect();
        
        // Show error popup
        setRoomNotFoundCode(roomCode);
        setShowRoomNotFoundPopup(true);
      };
      
      socket.on("roomReady", handleRoomReady);
      socket.on("joinError", handleJoinError);
      
      // Try to join room
      socket.emit("joinRoom", { roomCode, playerName: nama.trim() });
    });
  };

  const namaBorder = fokusNama ? "#C08030" : (error && !nama.trim()) ? "#C84040" : "#D4C8B0";

  return (
    <div
      style={{
        height: "100vh",
        background: "#F0E8D8",
        fontFamily: "'Press Start 2P', monospace",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── BACK BUTTON ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/start")}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#A03030";
          e.currentTarget.style.transform = "translate(-1px,-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#C84040";
          e.currentTarget.style.transform = "none";
        }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "#C84040",
          border: "2px solid #8C5A35",
          color: "#FFF",
          padding: "10px 14px",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "10px",
          cursor: "pointer",
          boxShadow: "2px 2px 0 #8C5A3560",
          transition: "all 0.1s ease",
          zIndex: 10,
        }}
      >
        ◀ KEMBALI
      </button>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        * { box-sizing: border-box; }
        input { -webkit-tap-highlight-color: transparent; }
        input::placeholder { opacity: 0.38; }
        button { font-family: 'Press Start 2P', monospace; }
      `}</style>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 20px 10px",
          minHeight: 0,
        }}
      >
        {/* ── TITLE ─────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "16px", animation: "fadeUp 0.3s ease" }}>
          <div
            style={{
              fontSize: "clamp(38px, 6.5vw, 54px)",
              color: "#2A1A18",
              textShadow: "4px 4px 0 #C8B888, 2px 2px 0 #D8CEB8",
              letterSpacing: "2px",
              lineHeight: 1,
            }}
          >
            TYPE<span style={{ color: "#C08030" }}>TUG</span>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#C08030",
              letterSpacing: "3px",
              marginTop: "10px",
            }}
          >
            ADU TARIK TAMBANG MENGETIK
          </div>

        </div>

        {/* ── CARD ──────────────────────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: "580px",
            background: "#FDFAF4",
            border: "3px solid #D8CEB8",
            boxShadow: "6px 6px 0 #C8B890",
            position: "relative",
            animation: "fadeUp 0.35s ease",
          }}
        >
          {/* Gold corner accents */}
          {(
            [
              { top: -5, left: -5 }, { top: -5, right: -5 },
              { bottom: -5, left: -5 }, { bottom: -5, right: -5 },
            ] as React.CSSProperties[]
          ).map((pos, i) => (
            <div
              key={i}
              style={{ position: "absolute", width: 10, height: 10, background: "#C08030", ...pos }}
            />
          ))}

          {/* ── NAMA PEMAIN ─────────────────────────────────────────────────── */}
          <div style={{ padding: "16px 22px 12px" }}>
            <div
              style={{
                color: "#7A6858",
                fontSize: "9px",
                letterSpacing: "1.5px",
                marginBottom: "8px",
              }}
            >
              ◈ NAMA PEMAIN
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: fokusNama ? "#FEFCF8" : "#F4EDE0",
                border: `2px solid ${namaBorder}`,
                padding: "0 14px",
                boxShadow: fokusNama ? "0 0 0 2px #C0803022" : "inset 2px 2px 0 #EDE5D0",
                transition: "all 0.12s",
              }}
            >
              <span style={{ color: "#C08030", fontSize: "16px", marginRight: "10px", flexShrink: 0 }}>
                ▸
              </span>
              <input
                ref={namaRef}
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value.toUpperCase().slice(0, 12));
                  setError("");
                }}
                onFocus={() => setFokusNama(true)}
                onBlur={() => setFokusNama(false)}
                onKeyDown={(e) => e.key === "Enter" && navigateGame(modeAktif)}
                placeholder=""
                maxLength={12}
                autoComplete="off"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#2A1A18",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "15px",
                  padding: "13px 0",
                  letterSpacing: "1px",
                  caretColor: "#C08030",
                }}
              />
              <span style={{ color: "#C0B098", fontSize: "8px", marginLeft: "10px", flexShrink: 0 }}>
                {nama.length}/12
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px",
                  background: "#FDF0F0",
                  border: "1px solid #E0B0B0",
                  padding: "7px 12px",
                  animation: "shake 0.3s ease",
                }}
              >
                <span style={{ color: "#C84040", fontSize: "12px" }}>✗</span>
                <span style={{ color: "#C84040", fontSize: "8px" }}>{error}</span>
              </div>
            )}
          </div>

          {/* ── HORIZONTAL DIVIDER ──────────────────────────────────────────── */}
          <div style={{ height: 2, background: "#E8DFC8", margin: "0 22px" }} />

          {/* ── GAME MODE — TWO COLUMNS ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

            {/* LEFT: LAWAN BOT */}
            <div
              style={{
                padding: "14px 16px 14px 22px",
                borderRight: "2px solid #E8DFC8",
              }}
            >
              <div
                style={{
                  color: "#C84040",
                  fontSize: "8px",
                  letterSpacing: "1.5px",
                  marginBottom: "10px",
                }}
              >
                ◈ LAWAN BOT
              </div>

              {/* Difficulty selector */}
              <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                {(["mudah", "sedang", "susah"] as TingkatBot[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTingkat(t)}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      background: tingkat === t ? "#C84040" : "#F8F2E8",
                      border: `2px solid ${tingkat === t ? "#901818" : "#D8CEB8"}`,
                      color: tingkat === t ? "#FDFAF4" : "#7A6858",
                      fontSize: "6px",
                      cursor: "pointer",
                      letterSpacing: "0.5px",
                      transition: "all 0.1s",
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Speed preview */}
              <div style={{ color: "#9A8878", fontSize: "7px", marginBottom: "10px" }}>
                KECEPATAN: {KPM_LABEL[tingkat]}
              </div>

              {/* LAWAN BOT button */}
              <button
                onClick={() => { setModeAktif("bot"); navigateGame("bot"); }}
                style={{
                  width: "100%",
                  padding: "11px",
                  background: modeAktif === "bot" ? "#C84040" : "#FDF0EE",
                  border: `2px solid ${modeAktif === "bot" ? "#8A1818" : "#C84040"}`,
                  color: modeAktif === "bot" ? "#FDFAF4" : "#C84040",
                  fontSize: "9px",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  boxShadow: "2px 2px 0 #90181840",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (modeAktif !== "bot") {
                    e.currentTarget.style.background = "#FEE8E8";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    modeAktif === "bot" ? "#C84040" : "#FDF0EE";
                }}
              >
                ▶ LAWAN BOT
              </button>
            </div>

            {/* RIGHT: ROOM */}
            <div style={{ padding: "14px 22px 14px 16px" }}>
              <div
                style={{
                  color: "#3A70B0",
                  fontSize: "8px",
                  letterSpacing: "1.5px",
                  marginBottom: "10px",
                }}
              >
                ◈ KODE ROOM
              </div>

              {/* Code input + GABUNG in a row */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    background: fokusKode ? "#F6FAFF" : "#F0F4F8",
                    border: `2px solid ${fokusKode ? "#3A70B0" : "#C4D0E8"}`,
                    padding: "0 8px",
                    transition: "all 0.12s",
                  }}
                >
                  <input
                    type="text"
                    value={kodeInput}
                    onChange={(e) => {
                      setKodeInput(e.target.value.toUpperCase().slice(0, 6));
                      setError("");
                      if (e.target.value.length > 0) setModeAktif("gabung");
                    }}
                    onFocus={() => setFokusKode(true)}
                    onBlur={() => setFokusKode(false)}
                    onKeyDown={(e) => e.key === "Enter" && navigateGame("gabung")}
                    placeholder="XXXXXX"
                    maxLength={6}
                    autoComplete="off"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#1A3870",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "11px",
                      padding: "9px 0",
                      letterSpacing: "4px",
                      caretColor: "#3A70B0",
                      textTransform: "uppercase",
                      width: 0,
                    }}
                  />
                </div>
                <button
                  onClick={() => { setModeAktif("gabung"); navigateGame("gabung"); }}
                  style={{
                    background: "#3A70B0",
                    border: "2px solid #1A3870",
                    color: "#FDFAF4",
                    fontSize: "8px",
                    padding: "0 12px",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: "2px 2px 0 #1A387050",
                    letterSpacing: "0.5px",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2A5898";
                    e.currentTarget.style.transform = "translate(-1px,-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#3A70B0";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  GABUNG
                </button>
              </div>

              {/* BUAT ROOM */}
              <button
                onClick={() => setModeAktif("buat")}
                style={{
                  width: "100%",
                  padding: "11px",
                  background: modeAktif === "buat" ? "#EDF3FD" : "#F8F2E8",
                  border: `2px solid #3A70B0`,
                  color: "#3A70B0",
                  fontSize: "9px",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  boxShadow: "2px 2px 0 #3A70B030",
                  transition: "all 0.1s",
                  marginBottom: modeAktif === "buat" ? "8px" : "0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E0EAF8";
                  e.currentTarget.style.transform = "translate(-1px,-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    modeAktif === "buat" ? "#EDF3FD" : "#F8F2E8";
                  e.currentTarget.style.transform = "none";
                }}
              >
                + BUAT ROOM
              </button>

              {/* Generated room code display */}
              {modeAktif === "buat" && (
                <div
                  style={{
                    textAlign: "center",
                    background: "#F0F6FF",
                    border: "1px solid #C4D0E8",
                    padding: "6px",
                    animation: "fadeUp 0.2s ease",
                  }}
                >
                  <div style={{ color: "#9A8878", fontSize: "6px", marginBottom: "3px" }}>
                    KODE ROOM KAMU:
                  </div>
                  <div
                    style={{
                      color: "#3A70B0",
                      fontSize: "15px",
                      letterSpacing: "5px",
                      textShadow: "1px 1px 0 #C4D0E8",
                    }}
                  >
                    {kodeGenerated}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── HORIZONTAL DIVIDER ──────────────────────────────────────────── */}
          <div style={{ height: 2, background: "#E8DFC8", margin: "0 22px" }} />

          {/* ── MULAI BERTARUNG ──────────────────────────────────────────────── */}
          <div style={{ padding: "13px 22px 16px" }}>
            <button
              onClick={() => navigateGame(modeAktif)}
              style={{
                width: "100%",
                background: "#C08030",
                border: "3px solid #8A5818",
                color: "#FDFAF4",
                fontSize: "14px",
                padding: "17px",
                cursor: "pointer",
                letterSpacing: "2px",
                boxShadow: "4px 4px 0 #6A3808",
                transition: "all 0.08s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-1px,-1px)";
                e.currentTarget.style.boxShadow = "6px 6px 0 #6A3808";
                e.currentTarget.style.background = "#D09040";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "4px 4px 0 #6A3808";
                e.currentTarget.style.background = "#C08030";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translate(3px,3px)";
                e.currentTarget.style.boxShadow = "1px 1px 0 #6A3808";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translate(-1px,-1px)";
                e.currentTarget.style.boxShadow = "6px 6px 0 #6A3808";
              }}
            >
              <span>▶</span>
              <span>MULAI BERTARUNG</span>
            </button>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ marginTop: "10px", color: "#B0A080", fontSize: "7px", letterSpacing: "1px" }}>
          TYPETUG ARKADE © 2026 — MODE 1 LAWAN 1
        </div>
      </div>

      {/* ── ROOM NOT FOUND POPUP ──────────────────────────────────────────── */}
      {showRoomNotFoundPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(42, 26, 24, 0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeUp 0.3s ease",
          }}
          onClick={() => setShowRoomNotFoundPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FDFAF4",
              border: "4px solid #C84040",
              boxShadow: "0 0 0 3px #8C5A35, 8px 8px 0 rgba(0,0,0,0.3)",
              padding: "32px 40px",
              maxWidth: "480px",
              width: "90%",
              position: "relative",
              animation: "fadeUp 0.35s ease",
            }}
          >
            {/* Decorative corners */}
            {[
              { top: -6, left: -6 }, { top: -6, right: -6 },
              { bottom: -6, left: -6 }, { bottom: -6, right: -6 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 12,
                  height: 12,
                  background: "#C84040",
                  border: "2px solid #8C5A35",
                  ...pos,
                }}
              />
            ))}

            {/* Error Icon */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "#FDE8E8",
                  border: "3px solid #C84040",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "32px", color: "#C84040" }}>✗</span>
              </div>
              
              <div
                style={{
                  fontSize: "18px",
                  color: "#C84040",
                  letterSpacing: "2px",
                  textShadow: "2px 2px 0 #E8D0D0",
                  marginBottom: "8px",
                }}
              >
                ROOM TIDAK DITEMUKAN
              </div>
              
              <div
                style={{
                  fontSize: "9px",
                  color: "#7A6858",
                  letterSpacing: "1px",
                }}
              >
                KODE ROOM TIDAK VALID
              </div>
            </div>

            {/* Room Code Display */}
            <div
              style={{
                background: "#FDF0F0",
                border: "2px solid #E8C0C0",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "8px", color: "#9A8878", marginBottom: "8px" }}>
                KODE YANG ANDA MASUKKAN:
              </div>
              <div
                style={{
                  fontSize: "24px",
                  color: "#C84040",
                  letterSpacing: "6px",
                  fontWeight: "bold",
                  textShadow: "2px 2px 0 #E8D0D0",
                }}
              >
                {roomNotFoundCode || "------"}
              </div>
            </div>

            {/* Error Message */}
            <div
              style={{
                background: "#FEF8E8",
                border: "2px solid #E8D0B0",
                padding: "14px",
                marginBottom: "24px",
              }}
            >
              <div style={{ fontSize: "8px", color: "#7A6858", lineHeight: 1.6 }}>
                ⚠️ Room dengan kode tersebut tidak ditemukan atau sudah tidak aktif.
                <br /><br />
                Pastikan:
                <br />• Kode room benar
                <br />• Room masih aktif
                <br />• Host belum menutup room
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowRoomNotFoundPopup(false);
                setKodeInput("");
                setRoomNotFoundCode("");
              }}
              style={{
                width: "100%",
                background: "#C84040",
                border: "3px solid #8A1818",
                color: "#FDFAF4",
                fontSize: "12px",
                padding: "14px",
                cursor: "pointer",
                letterSpacing: "2px",
                boxShadow: "3px 3px 0 #6A1010",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-1px,-1px)";
                e.currentTarget.style.boxShadow = "5px 5px 0 #6A1010";
                e.currentTarget.style.background = "#D05050";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "3px 3px 0 #6A1010";
                e.currentTarget.style.background = "#C84040";
              }}
            >
              ✓ MENGERTI
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
