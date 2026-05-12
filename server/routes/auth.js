import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { parseJsonBody, sendJson } from "../utils/http.js";
import { 
  validateRegisterInput, 
  signToken, 
  userResponse, 
  decodeGoogleCredential, 
  createUniqueUsername, 
  verifyToken 
} from "../utils/auth.js";

export async function handleAuthRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (!url.pathname.startsWith("/api/auth")) return false;

  if (req.method === "OPTIONS") {
    sendJson(req, res, 204, {});
    return true;
  }

  try {
    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const { username, email, password } = await parseJsonBody(req);
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedUsername = String(username || "").trim();
      const validationError = validateRegisterInput(normalizedUsername, normalizedEmail, password);
      if (validationError) {
        sendJson(req, res, 400, { message: validationError });
        return true;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      try {
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedUsername)}&background=C08030&color=fff&size=96`;
        
        const result = db
          .prepare("INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)")
          .run(normalizedUsername, normalizedEmail, passwordHash, defaultAvatar);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
        sendJson(req, res, 201, { token: signToken(user.id), user: userResponse(user) });
      } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
          sendJson(req, res, 409, { message: "Email atau username sudah dipakai." });
          return true;
        }
        throw error;
      }
      return true;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const { email, password } = await parseJsonBody(req);
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);

      if (!user || !user.password_hash || !(await bcrypt.compare(String(password || ""), user.password_hash))) {
        sendJson(req, res, 401, { message: "Email atau password salah." });
        return true;
      }

      sendJson(req, res, 200, { token: signToken(user.id), user: userResponse(user) });
      return true;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/google") {
      const { credential } = await parseJsonBody(req);
      const profile = decodeGoogleCredential(credential);
      if (!profile.sub || !profile.email) {
        sendJson(req, res, 400, { message: "Credential Google tidak lengkap." });
        return true;
      }

      const googleId = String(profile.sub);
      const email = String(profile.email).trim().toLowerCase();
      let user = db
        .prepare("SELECT * FROM users WHERE google_id = ? OR email = ?")
        .get(googleId, email);

      if (user) {
        db.prepare("UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = ? WHERE id = ?")
          .run(googleId, profile.picture || null, user.id);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      } else {
        const username = createUniqueUsername(profile.name, email);
        const result = db
          .prepare("INSERT INTO users (username, email, google_id, avatar_url) VALUES (?, ?, ?, ?)")
          .run(username, email, googleId, profile.picture || null);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      }

      sendJson(req, res, 200, { token: signToken(user.id), user: userResponse(user) });
      return true;
    }

    if (req.method === "GET" && url.pathname === "/api/auth/me") {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const payload = verifyToken(token);
      if (!payload?.userId) {
        sendJson(req, res, 401, { message: "Token tidak valid." });
        return true;
      }

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.userId);
      if (!user) {
        sendJson(req, res, 401, { message: "User tidak ditemukan." });
        return true;
      }

      sendJson(req, res, 200, { user: userResponse(user) });
      return true;
    }

    sendJson(req, res, 404, { message: "Endpoint auth tidak ditemukan." });
    return true;
  } catch (error) {
    sendJson(req, res, 500, { message: error.message || "Terjadi kesalahan server." });
    return true;
  }
}
