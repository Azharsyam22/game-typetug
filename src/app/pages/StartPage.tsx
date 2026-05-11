import { useEffect } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import bgStartImage from "../../assets/image/background-start page.png";
import { useAuth } from "../contexts/AuthContext";

export default function StartPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    // Navigasi ke lobby ketika tombol apapun ditekan di keyboard
    const handleKeyDown = () => {
      navigate("/lobby");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div
      onClick={() => navigate("/lobby")}
      style={{
        height: "100vh",
        backgroundImage: `url("${bgStartImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#F0E8D8",
        fontFamily: "'Press Start 2P', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "18px",
          right: "18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#FDFAF4",
          border: "2px solid #8C5A35",
          boxShadow: "3px 3px 0 #C8B890",
          padding: "8px 10px",
          cursor: "default",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.username}
            style={{ width: "28px", height: "28px", borderRadius: "50%" }}
          />
        )}
        <span style={{ color: "#2A1A18", fontSize: "8px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {user?.username || "PLAYER"}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "#C84040",
            border: "2px solid #8A1818",
            color: "#FDFAF4",
            padding: "7px 9px",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "7px",
            cursor: "pointer",
          }}
        >
          LOGOUT
        </button>
      </div>
      <style>{`
        @keyframes slowBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      {/* ── TITLE BLOCK ─────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "80px", animation: "float 4s ease-in-out infinite" }}>
        <div
          style={{
            fontSize: "clamp(54px, 10vw, 84px)",
            color: "#2A1A18",
            textShadow: "6px 6px 0 #C8B888, 3px 3px 0 #D8CEB8",
            letterSpacing: "4px",
            lineHeight: 1,
          }}
        >
          TYPE<span style={{ color: "#C08030" }}>TUG</span>
        </div>
        <div
          style={{
            fontSize: "clamp(12px, 2.5vw, 16px)",
            color: "#C08030",
            letterSpacing: "4px",
            marginTop: "16px",
            textShadow: "2px 2px 0 #8C5A35, 1px 1px 0 #D8CEB8",
          }}
        >
          ADU TARIK TAMBANG MENGETIK
        </div>

      </div>

      {/* ── BLINKING START TEXT ─────────────────────────────────────────── */}
      <div
        style={{
          color: "#7A6858",
          fontSize: "clamp(12px, 3vw, 16px)",
          letterSpacing: "2px",
          textShadow: "2px 2px 0 #2A1A18",
          animation: "slowBlink 1.8s ease-in-out infinite",
        }}
      >
        [ PRESS ANY BUTTON ]
      </div>
    </div>
  );
}
