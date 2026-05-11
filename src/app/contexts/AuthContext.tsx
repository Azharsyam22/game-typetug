import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "typetug_auth";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface StoredAuth {
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request autentikasi gagal.");
  }
  return data as AuthResponse;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth) as StoredAuth;
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuth = (auth: StoredAuth) => {
    setUser(auth.user);
    setToken(auth.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  };

  const login = async (email: string, password: string) => {
    const auth = await parseAuthResponse(
      await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    );
    saveAuth(auth);
  };

  const register = async (username: string, email: string, password: string) => {
    const auth = await parseAuthResponse(
      await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }),
    );
    saveAuth(auth);
  };

  const loginWithGoogle = async (credential: string) => {
    const auth = await parseAuthResponse(
      await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      }),
    );
    saveAuth(auth);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, loginWithGoogle, logout }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
