import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import bgStartImage from "../../assets/image/background-start page.png";
import { useAuth } from "../contexts/AuthContext";

export default function StartPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPulse, setShowPulse] = useState(true);

  const handleLogout = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    // Stop pulse animation after 3 seconds
    const timer = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
          animation: `fadeIn 0.8s ease${showPulse ? ', subtlePulse 2s ease-in-out infinite' : ''}`,
          transition: "box-shadow 0.3s ease",
        }}
        onClick={(event) => event.stopPropagation()}
        onMouseEnter={(e) => {
          if (!showPulse) {
            e.currentTarget.style.boxShadow = "3px 3px 0 #C8B890, 0 0 20px rgba(192, 128, 48, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!showPulse) {
            e.currentTarget.style.boxShadow = "3px 3px 0 #C8B890";
          }
        }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            onError={(e) => {
              // Fallback jika gambar gagal dimuat
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=C08030&color=fff&size=96`;
            }}
            style={{ 
              width: "28px", 
              height: "28px", 
              borderRadius: "50%", 
              objectFit: "cover",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(192, 128, 48, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#C08030",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(192, 128, 48, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {(user?.username || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <span 
          style={{ 
            color: "#2A1A18", 
            fontSize: "8px", 
            maxWidth: "160px", 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            transition: "color 0.3s ease, transform 0.3s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#C08030";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#2A1A18";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
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
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#A03030";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(200, 64, 64, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#C84040";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1)";
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
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes subtlePulse {
          0%, 100% {
            box-shadow: 3px 3px 0 #C8B890;
          }
          50% {
            box-shadow: 3px 3px 0 #C8B890, 0 0 15px rgba(192, 128, 48, 0.3);
          }
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
