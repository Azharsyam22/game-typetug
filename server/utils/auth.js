import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const JWT_SECRET = process.env.JWT_SECRET || "typetug-dev-secret-change-me-9f31b4a7d6";

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function validateRegisterInput(username, email, password) {
  if (!/^[A-Za-z0-9_]{2,20}$/.test(username || "")) {
    return "Username harus 2-20 karakter dan hanya berisi huruf, angka, atau underscore.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
    return "Email tidak valid.";
  }

  if (!password || password.length < 6) {
    return "Password minimal 6 karakter.";
  }

  return null;
}

export function decodeGoogleCredential(credential) {
  const [, payload] = String(credential || "").split(".");
  if (!payload) throw new Error("Credential Google tidak valid");

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    "=",
  );
  return JSON.parse(Buffer.from(paddedPayload, "base64").toString("utf8"));
}

export function createUniqueUsername(name, email) {
  const source = name || email?.split("@")[0] || "player";
  const base = source
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16) || "player";

  let username = base.length >= 2 ? base : `${base}_1`;
  let suffix = 1;
  const exists = db.prepare("SELECT id FROM users WHERE username = ?");
  while (exists.get(username)) {
    const suffixText = `_${suffix}`;
    username = `${base.slice(0, 20 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }
  return username;
}

export function userResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatar_url || undefined,
  };
}
