import { useEffect, useRef } from "react";

interface TypingAreaProps {
  words: string[];
  currentWordIndex: number;
  typedCorrect: string;
  typedWrong: string;
  inputValue: string;
  onInput: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmitWord: () => void;
  wpm: number;
  accuracy: number;
  timeLeft: number;
  gamePhase: "waiting" | "countdown" | "playing" | "finished";
  countdown: number;
}

export function TypingArea({
  words,
  currentWordIndex,
  typedCorrect,
  typedWrong,
  inputValue,
  onInput,
  onKeyDown,
  onSubmitWord,
  wpm,
  accuracy,
  timeLeft,
  gamePhase,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gamePhase === "playing") inputRef.current?.focus();
  }, [gamePhase]);

  useEffect(() => {
    currentWordRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentWordIndex]);

  const hasError = typedWrong.length > 0;
  const timerRed = timeLeft <= 10;
  const timerOrange = timeLeft <= 20 && timeLeft > 10;

  return (
    <div className="typing-area" style={{ fontFamily: "'Press Start 2P', monospace", display: "flex", flexDirection: "column", gap: "6px" }}>
      <style>{`
        @media (max-width: 760px) {
          .typing-stats {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            gap: 6px !important;
            padding: 6px 8px !important;
          }
          .typing-stat-group {
            gap: 8px !important;
            min-width: 0 !important;
          }
          .typing-stat-badge span:first-child {
            font-size: 6px !important;
          }
          .typing-stat-badge span:last-child {
            font-size: 10px !important;
          }
          .typing-timer span:nth-child(2) {
            font-size: 22px !important;
            min-width: 38px !important;
          }
          .typing-timer span:last-child {
            display: none !important;
          }
          .typing-word-panel {
            min-height: 58px !important;
            max-height: 58px !important;
            padding: 9px 8px !important;
          }
          .typing-word-list {
            gap: 5px !important;
          }
          .typing-word-list span {
            padding: 3px 4px !important;
          }
          .typing-word-list span span {
            font-size: 16px !important;
            letter-spacing: 0 !important;
          }
          .typing-input-row {
            padding: 5px 7px !important;
            gap: 7px !important;
          }
          .typing-input-row input {
            font-size: 16px !important;
            letter-spacing: 0.5px !important;
            min-width: 0 !important;
          }
          .typing-error-pill {
            display: none !important;
          }
          .typing-submit-button {
            display: inline-flex !important;
          }
          .typing-hint-row {
            gap: 8px !important;
          }
          .typing-hint-row span {
            font-size: 6px !important;
          }
        }
      `}</style>

      {/* Stats bar */}
      <div
        className="typing-stats"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#E5CBA2", // Warna kertas perkamen
          border: "2px solid #8C5A35", // Border coklat retro
          padding: "6px 14px",
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.4), 2px 2px 0 #8C5A3580",
        }}
      >
        <div className="typing-stat-group" style={{ display: "flex", gap: "24px" }}>
          <StatBadge label="WPM" value={wpm} color="#C84040" />
          <StatBadge label="AKURASI" value={`${accuracy}%`} color="#3A70B0" />
        </div>

        {/* Timer — big and prominent */}
        <div className="typing-timer" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 12,
              height: 12,
              background: timerRed ? "#C84040" : timerOrange ? "#C08030" : "#4A9060",
              animation: timerRed ? "blinkPulse 0.5s step-end infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "30px",
              color: timerRed ? "#C84040" : timerOrange ? "#C08030" : "#2A1A18",
              minWidth: "52px",
              textAlign: "center",
            }}
          >
            {String(timeLeft).padStart(2, "0")}
          </span>
          <span style={{ color: "#9A8878", fontSize: "8px" }}>DTK</span>
        </div>

        <div className="typing-stat-group" style={{ display: "flex", gap: "24px" }}>
          <StatBadge label="KATA" value={currentWordIndex} color="#6A5878" />
          <StatBadge label="SISA" value={Math.max(0, words.length - currentWordIndex)} color="#9A7848" />
        </div>
      </div>

      {/* Text display — enlarged */}
      <div
        ref={wrapRef}
        className="typing-word-panel"
        style={{
          background: "#F4E4C8",
          border: `2px solid ${hasError ? "#C84040" : "#8C5A35"}`,
          padding: "12px 12px",
          minHeight: "45px",
          maxHeight: "45px",
          overflow: "hidden",
          position: "relative",
          fontFamily: "'Consolas', 'Courier New', monospace",
          boxShadow: hasError
            ? "inset 2px 2px 0 #F0D8D8, 2px 2px 0 #C8404060"
            : "inset 2px 2px 0 rgba(255,255,255,0.4), 2px 2px 0 #8C5A3540",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        {/* Terminal label */}
        <div
          style={{
            position: "absolute",
            top: 5,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FDFAF4",
            padding: "0 8px",
          }}
        >
          <span style={{ color: "#C4B8A0", fontSize: "7px" }}></span>
        </div>

        {/* Corner brackets */}
        {[
          { top: 0, left: 0, borderTop: `2px solid #8C5A35`, borderLeft: `2px solid #8C5A35` },
          { top: 0, right: 0, borderTop: `2px solid #8C5A35`, borderRight: `2px solid #8C5A35` },
          { bottom: 0, left: 0, borderBottom: `2px solid #8C5A35`, borderLeft: `2px solid #8C5A35` },
          { bottom: 0, right: 0, borderBottom: `2px solid #8C5A35`, borderRight: `2px solid #8C5A35` },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 14, height: 14, ...s }} />
        ))}

        {/* Words — wrapped single line */}
        <div className="typing-word-list" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "2px", overflow: "hidden" }}>
          {words.map((word, wi) => {
            const isDone = wi < currentWordIndex;
            const isCurrent = wi === currentWordIndex;

            return (
              <span
                key={wi}
                ref={isCurrent ? currentWordRef : null}
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  background: "transparent",
                  outline: "none",
                }}
              >
                {word.split("").map((char, ci) => {
                  let color = "#A89888";
                  let fontWeight = "bold";
                  let textDecoration = "none";

                  if (isDone) {
                    color = "#50B070"; // Kata selesai = hijau
                  } else if (isCurrent) {
                    const typed = typedCorrect + typedWrong;
                    if (ci < typedCorrect.length) {
                      color = "#50B070"; // Huruf benar = hijau
                    } else if (ci < typed.length) {
                      color = "#C84040"; // Huruf salah = merah
                    } else if (ci === typed.length) {
                      color = "#2A1A18"; // Kursor
                      textDecoration = "underline"; // Kasih sedikit indikasi kursor di bawah huruf
                    } else {
                      color = "#2A1A18"; // Belum diketik
                    }
                  } else {
                    color = "#2A1A18"; // Kata berikutnya
                  }

                  return (
                    <span
                      key={ci}
                      style={{
                        position: "relative",
                        fontSize: "18px",
                        fontWeight,
                        color,
                        letterSpacing: "0.5px",
                        textDecoration,
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div
        className="typing-input-row"
        style={{
          background: "#F4E4C8",
          border: `2px solid ${hasError ? "#C84040" : "#8C5A35"}`,
          display: "flex",
          alignItems: "center",
          padding: "4px 10px",
          gap: "10px",
          boxShadow: hasError ? "2px 2px 0 #C8404060" : "inset 2px 2px 0 rgba(255,255,255,0.4), 2px 2px 0 #8C5A3540",
          transition: "border-color 0.1s",
        }}
      >
        <span style={{ color: "#C08030", fontSize: "16px", flexShrink: 0 }}>▸</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={gamePhase !== "playing"}
          inputMode="text"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: hasError ? "#C84040" : "#2A1A18",
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: "16px",
            letterSpacing: "1px",
            caretColor: "transparent",
          }}
          placeholder={
            gamePhase === "waiting" ? "TEKAN SPASI UNTUK MULAI..."
              : gamePhase === "countdown" ? "BERSIAP..."
              : gamePhase === "finished" ? "TEKAN SPASI UNTUK MAIN LAGI..."
              : "KETIK DI SINI..."
          }
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-gramm="false"
          data-ms-editor="false"
          data-enable-grammarly="false"
          list="autocompleteOff"
        />
        <datalist id="autocompleteOff"></datalist>
        {gamePhase === "playing" && (
          <span style={{ color: "#C08030", fontSize: "18px", animation: "blinkPulse 0.7s step-end infinite", flexShrink: 0 }}>
            █
          </span>
        )}
        <div
          className="typing-error-pill"
          style={{
            background: "#F0D8D8",
            border: "1px solid #D09090",
            padding: "4px 9px",
            flexShrink: 0,
            visibility: hasError ? "visible" : "hidden",
          }}
        >
          <span style={{ color: "#C84040", fontSize: "8px" }}>✗ SALAH</span>
        </div>
        <button
          type="button"
          className="typing-submit-button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onSubmitWord}
          disabled={gamePhase !== "playing"}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "34px",
            padding: "0 10px",
            background: "#C08030",
            border: "2px solid #8C5A35",
            color: "#FDFAF4",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "8px",
            flexShrink: 0,
            boxShadow: "2px 2px 0 #8C5A3540",
          }}
        >
          OK
        </button>
      </div>

      {/* Hint row */}
      <div className="typing-hint-row" style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }}>
        <span style={{ color: "#B0A090", fontSize: "7px" }}>SPASI = KONFIRMASI KATA</span>
        <span style={{ color: "#B0A090", fontSize: "7px" }}>
          {gamePhase === "playing" && `KATA KE-${currentWordIndex + 1} / ${words.length}`}
        </span>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="typing-stat-badge" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <span style={{ color: "#9A8878", fontSize: "7px" }}>{label}</span>
      <span style={{ color, fontSize: "14px" }}>{value}</span>
    </div>
  );
}
