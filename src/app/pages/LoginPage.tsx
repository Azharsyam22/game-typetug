import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useNavigate } from "react-router";
import bgStartImage from "../../assets/image/background-start page.png";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "masuk" | "daftar";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasGoogleClientId = Boolean(
  googleClientId && !googleClientId.includes("paste") && !googleClientId.includes("client-id-kamu"),
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AuthMode>("masuk");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasGoogleClientId) return;

    let isCancelled = false;

    const initializeGoogleSignIn = () => {
      if (isCancelled || !window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            if (!response.credential) {
              throw new Error("Google tidak mengirim credential.");
            }

            setError("");
            setIsSubmitting(true);
            await loginWithGoogle(response.credential);
            navigate("/start", { replace: true });
          } catch (authError) {
            setError(authError instanceof Error ? authError.message : "Login Google gagal.");
          } finally {
            setIsSubmitting(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_blue",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 280,
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      if (window.google) {
        initializeGoogleSignIn();
      } else {
        existingScript.addEventListener("load", initializeGoogleSignIn, { once: true });
      }
      return () => {
        isCancelled = true;
        existingScript.removeEventListener("load", initializeGoogleSignIn);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    script.onerror = () => setError("Gagal memuat Google Identity Services.");
    document.head.appendChild(script);

    return () => {
      isCancelled = true;
    };
  }, [loginWithGoogle, navigate]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "daftar" && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "masuk") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate("/start", { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Autentikasi gagal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "#F4EDE0",
    border: "2px solid #D4C8B0",
    color: "#2A1A18",
    fontFamily: "'Press Start 2P', monospace",
    fontSize: "10px",
    padding: "13px 12px",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(42, 26, 24, 0.58), rgba(42, 26, 24, 0.58)), url("${bgStartImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#F0E8D8",
        fontFamily: "'Press Start 2P', monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#2A1A18",
          border: "4px solid #C08030",
          boxShadow: "8px 8px 0 rgba(0,0,0,0.35)",
          padding: "28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "clamp(34px, 8vw, 52px)",
            lineHeight: 1,
            color: "#F0E8D8",
            textShadow: "4px 4px 0 #8C5A35",
            marginBottom: "18px",
          }}
        >
          TYPE<span style={{ color: "#C08030" }}>TUG</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {(["masuk", "daftar"] as AuthMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchMode(option)}
              style={{
                background: mode === option ? "#C08030" : "#3A2824",
                border: `2px solid ${mode === option ? "#F0E8D8" : "#8C5A35"}`,
                color: mode === option ? "#2A1A18" : "#F0E8D8",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "9px",
                padding: "12px 8px",
                cursor: "pointer",
              }}
            >
              {option === "masuk" ? "MASUK" : "DAFTAR"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === "daftar" && (
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="USERNAME"
              autoComplete="username"
              required
              style={inputStyle}
            />
          )}
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="EMAIL"
            type="email"
            autoComplete="email"
            required
            style={inputStyle}
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="PASSWORD"
            type="password"
            autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            required
            style={inputStyle}
          />
          {mode === "daftar" && (
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="KONFIRMASI PASSWORD"
              type="password"
              autoComplete="new-password"
              required
              style={inputStyle}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? "#8C5A35" : "#C08030",
              border: "3px solid #F0E8D8",
              color: "#2A1A18",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "12px",
              padding: "15px",
              cursor: isSubmitting ? "wait" : "pointer",
              boxShadow: "4px 4px 0 #00000055",
              marginTop: "4px",
            }}
          >
            {isSubmitting ? "MEMPROSES..." : mode === "masuk" ? "MASUK" : "DAFTAR"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "16px",
              background: "#FDF0F0",
              border: "2px solid #C84040",
              color: "#C84040",
              padding: "11px",
              fontSize: "8px",
              lineHeight: 1.7,
            }}
          >
            {error}
          </div>
        )}

        {hasGoogleClientId && (
          <>
            <div style={{ color: "#C8B890", fontSize: "8px", margin: "22px 0 14px" }}>── ATAU ──</div>
            <div style={{ display: "flex", justifyContent: "center", minHeight: "44px" }}>
              <div ref={googleButtonRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
