import { useEffect, useRef } from "react";
import { Sparkline } from "./Sparkline";

export interface PlayerData {
  name: string;
  wpm: number;
  accuracy: number;
  progress: number;
  isTyping: boolean;
  wpmHistory: number[];
}

interface PlayerPanelProps {
  team: "red" | "blue";
  player: PlayerData;
}

// ── Portrait avatar ────────────────────────────────────────────────────────────
function PixelPortrait({ team, isTyping, seed }: { team: "red" | "blue"; isTyping: boolean; seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const SIZE = 88;
  const P = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const isRed = team === "red";

    // Colors
    const helmetCol = isRed ? "#901818" : "#1A3060";
    const armorCol = isRed ? "#C84040" : "#3A70B0";
    const armorLight = isRed ? "#E06868" : "#6898D8";
    const armorDark = isRed ? "#601010" : "#102048";
    const gold = "#C08820";
    const goldL = "#E0A830";
    const skin = "#D4A07A";
    const visor = "#1A1830";
    const bgFrom = isRed ? "#FDF1F0" : "#F0F3FD";
    const bgTo = isRed ? "#F8E4E2" : "#E4EBF8";

    // BG gradient
    const grad = ctx.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, bgFrom);
    grad.addColorStop(1, bgTo);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Subtle checkerboard bg pattern
    for (let gx = 0; gx < SIZE; gx += 8) {
      for (let gy = 0; gy < SIZE; gy += 8) {
        if ((gx / 8 + gy / 8) % 2 === 0) {
          ctx.fillStyle = "rgba(0,0,0,0.025)";
          ctx.fillRect(gx, gy, 8, 8);
        }
      }
    }

    const cx = SIZE / 2;
    const r = (px: number, py: number, pw: number, ph: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(cx + px * P), Math.round(py * P), Math.round(pw * P), Math.round(ph * P));
    };

    // HELMET PLUME
    r(-1, 0.5, 2, 1, goldL);
    r(-1.5, 1.5, 3, 1, goldL);
    r(-2, 2.5, 4, 1.5, gold);

    // HELMET BODY
    r(-4, 4, 8, 1, helmetCol);
    r(-4.5, 5, 9, 2, armorCol);

    // VISOR
    r(-3, 5, 6, 2, visor);
    r(-3, 5, 2, 1, "#404060");     // reflection

    // Gold helm band
    r(-4.5, 7, 9, 0.8, gold);

    // Cheekguards
    r(-4.5, 7.8, 1, 2, helmetCol);
    r(3.5, 7.8, 1, 2, helmetCol);

    // Lower face / jaw
    r(-3.5, 7.8, 7, 2, armorCol);

    // Chin trim
    r(-4.5, 9.5, 9, 0.6, gold);

    // NECK / GORGET
    r(-1.5, 10, 3, 1, skin);

    // PAULDRONS (visible shoulders)
    r(-7.5, 10, 3.5, 3, armorDark);
    r(-7.5, 10, 3.5, 0.8, gold);
    r(4, 10, 3.5, 3, armorDark);
    r(4, 10, 3.5, 0.8, gold);

    // CHEST
    r(-3.5, 11, 7, 5, armorCol);
    r(-2.5, 11, 5, 1, armorLight);  // highlight
    r(-3.5, 11, 1, 5, armorDark);   // left edge
    r(2.5, 11, 1, 5, armorDark);    // right edge

    // Chest crest
    r(-1, 12.5, 2, 0.8, goldL);
    r(-1.5, 13.3, 3, 2, gold);
    r(-0.5, 13.8, 1, 1, goldL);

    // PARTIAL ARMS
    r(-7, 12, 3.5, 4, armorDark);   // left arm
    r(3.5, 12, 3.5, 4, armorDark);  // right arm
    r(-6.5, 12, 3, 1, gold);        // trim
    r(3.5, 12, 3, 1, gold);         // trim

    // PORTRAIT FRAME / BORDER
    const borderCol = isTyping
      ? (isRed ? "#C84040" : "#3A70B0")
      : (isRed ? "#D8B4B0" : "#B4C0D8");
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, SIZE - 3, SIZE - 3);

    // Corner pixel marks
    ctx.fillStyle = borderCol;
    ctx.fillRect(0, 0, 6, 6);
    ctx.fillRect(SIZE - 6, 0, 6, 6);
    ctx.fillRect(0, SIZE - 6, 6, 6);
    ctx.fillRect(SIZE - 6, SIZE - 6, 6, 6);
    ctx.fillStyle = bgFrom;
    ctx.fillRect(2, 2, 4, 4);
    ctx.fillRect(SIZE - 6, 2, 4, 4);
    ctx.fillRect(2, SIZE - 6, 4, 4);
    ctx.fillRect(SIZE - 6, SIZE - 6, 4, 4);

    // TYPING indicator (glow overlay)
    if (isTyping) {
      ctx.fillStyle = isRed ? "rgba(200,64,64,0.08)" : "rgba(58,112,176,0.08)";
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
  }, [team, isTyping, seed, SIZE, P]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{
        imageRendering: "pixelated",
        filter: isTyping
          ? `drop-shadow(0 0 8px ${team === "red" ? "#C84040" : "#3A70B0"}60)`
          : "none",
        transition: "filter 0.2s",
      }}
    />
  );
}

// ── Panel theme ────────────────────────────────────────────────────────────────
const THEME = {
  red: {
    bg: "#FDFAF8",
    headerBg: "#FDF3F2",
    border: "#E8C8C4",
    headerBorder: "#E0B8B4",
    accent: "#C84040",
    accentLight: "#E06868",
    accentDim: "#F8EDED",
    label: "#C84040",
    barBg: "#F0E0DC",
    teamLabel: "◀ TIM MERAH",
    sparkColor: "#C84040",
  },
  blue: {
    bg: "#F8FAFE",
    headerBg: "#F2F6FD",
    border: "#C4D0E8",
    headerBorder: "#B4C4E0",
    accent: "#3A70B0",
    accentLight: "#6898D8",
    accentDim: "#EDF3FD",
    label: "#3A70B0",
    barBg: "#DDE8F8",
    teamLabel: "TIM BIRU ▶",
    sparkColor: "#3A70B0",
  },
};

export function PlayerPanel({ team, player }: PlayerPanelProps) {
  const T = THEME[team];
  const isRed = team === "red";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: T.bg,
        border: `2px solid ${T.border}`,
        fontFamily: "'Press Start 2P', monospace",
        boxShadow: `2px 2px 0 ${T.border}, 4px 4px 0 ${T.border}80`,
      }}
    >
      {/* Team header */}
      <div
        style={{
          background: T.headerBg,
          borderBottom: `2px solid ${T.headerBorder}`,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <span style={{ color: T.accent, fontSize: "11px", letterSpacing: "0.5px" }}>
          {T.teamLabel}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <PixelPortrait team={team} isTyping={player.isTyping} seed={42} />
          {player.isTyping && (
            <div
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                background: "#4A9060",
                width: 10,
                height: 10,
                border: `1px solid ${T.bg}`,
                animation: "blinkPulse 0.5s step-end infinite",
              }}
            />
          )}
        </div>

        {/* Player name */}
        <div
          style={{
            background: T.accentDim,
            border: `2px solid ${T.border}`,
            padding: "6px 10px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <span style={{ color: T.accent, fontSize: "10px", letterSpacing: "0.5px" }}>
            {player.name}
          </span>
        </div>

        {/* Big WPM */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ color: "#7A6858", fontSize: "9px", marginBottom: "4px" }}>KATA PER MENIT</div>
          <div
            style={{
              color: T.accent,
              fontSize: "62px",
              lineHeight: 1,
              textShadow: `3px 3px 0 ${T.border}`,
            }}
          >
            {player.wpm}
          </div>
          <div style={{ color: "#9A8878", fontSize: "9px", marginTop: "4px" }}>KPM</div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 2, background: T.border }} />

        {/* Accuracy */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ color: "#7A6858", fontSize: "9px", marginBottom: "5px" }}>AKURASI</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "3px" }}>
            <span style={{ color: "#2A1A18", fontSize: "40px" }}>{player.accuracy}</span>
            <span style={{ color: T.accent, fontSize: "12px" }}>%</span>
          </div>

          {/* Accuracy bar */}
          <div
            style={{
              background: T.barBg,
              height: 10,
              width: "100%",
              marginTop: 6,
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                width: `${player.accuracy}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${T.accent}, ${T.accentLight})`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 2, background: T.border }} />

        {/* Progress */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ color: "#7A6858", fontSize: "9px", marginBottom: "5px" }}>PROGRES TEKS</div>
          <div
            style={{
              background: T.barBg,
              height: 14,
              width: "100%",
              border: `1px solid ${T.border}`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${player.progress}%`,
                height: "100%",
                background: T.accent,
                transition: "width 0.4s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 5,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#2A1A18",
                fontSize: "7px",
              }}
            >
              {player.progress}%
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 2, background: T.border }} />

        {/* Sparkline */}
        <div style={{ width: "100%" }}>
          <div style={{ color: "#7A6858", fontSize: "9px", marginBottom: "5px" }}>
            RIWAYAT KPM
          </div>
          <Sparkline data={player.wpmHistory} color={T.sparkColor} width={200} height={40} />
        </div>

        {/* Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 10px",
            background: player.isTyping ? T.accentDim : "transparent",
            border: `1px solid ${player.isTyping ? T.border : "transparent"}`,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: player.isTyping ? "#4A9060" : "#C0B8A8",
              animation: player.isTyping ? "blinkPulse 0.5s step-end infinite" : "none",
            }}
          />
          <span style={{ color: player.isTyping ? "#4A9060" : "#9A8878", fontSize: "8px" }}>
            {player.isTyping ? "SEDANG MENGETIK..." : "MENUNGGU..."}
          </span>
        </div>
      </div>
    </div>
  );
}