import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function loadEnvFile() {
  if (!fs.existsSync(".env")) return;

  const lines = fs.readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").trim();
    }
  }
}

loadEnvFile();

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:5173", "http://localhost:5174"];
const JWT_SECRET = process.env.JWT_SECRET || "typetug-dev-secret-change-me-9f31b4a7d6";

const db = new Database("typetug.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
console.log("Database siap");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const rooms = {};

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getCorsOrigin(req) {
  const origin = req.headers.origin;
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

function sendJson(req, res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": getCorsOrigin(req),
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload terlalu besar"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON tidak valid"));
      }
    });
    req.on("error", reject);
  });
}

function userResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatar_url || undefined,
  };
}

function validateRegisterInput(username, email, password) {
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

function decodeGoogleCredential(credential) {
  const [, payload] = String(credential || "").split(".");
  if (!payload) throw new Error("Credential Google tidak valid");

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    "=",
  );
  return JSON.parse(Buffer.from(paddedPayload, "base64").toString("utf8"));
}

function createUniqueUsername(name, email) {
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

async function handleAuthRequest(req, res) {
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
        // Generate default avatar untuk user baru
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
        // Update google_id dan avatar_url dari Google (selalu update avatar terbaru)
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

httpServer.on("request", (req, res) => {
  handleAuthRequest(req, res).then((handled) => {
    if (!handled && !res.writableEnded && !req.url?.startsWith("/socket.io")) {
      sendJson(req, res, 404, { message: "Not found" });
    }
  });
});

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // 1. Membuat Room (Host)
  socket.on("createRoom", ({ roomCode, playerName }) => {
    rooms[roomCode] = {
      players: {
        [socket.id]: { name: playerName, role: "host", wpm: 0, accuracy: 100, progress: 0, score: 0 }
      },
      status: "waiting",
    };
    socket.join(roomCode);
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  // 2. Bergabung ke Room
  socket.on("checkRoom", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit("roomCheckResult", { ok: false, message: "Ruangan tidak ditemukan!" });
      return;
    }

    if (Object.keys(room.players).length >= 2) {
      socket.emit("roomCheckResult", { ok: false, message: "Ruangan sudah penuh!" });
      return;
    }

    socket.emit("roomCheckResult", { ok: true });
  });

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    if (room) {
      const playerIds = Object.keys(room.players);
      if (playerIds.length >= 2) {
        socket.emit("joinError", "Ruangan sudah penuh!");
        return;
      }

      room.players[socket.id] = { name: playerName, role: "challenger", wpm: 0, accuracy: 100, progress: 0, score: 0 };
      socket.join(roomCode);
      console.log(`${playerName} joined ${roomCode}`);

      // Beritahu semua orang di room bahwa game bisa dimulai
      io.to(roomCode).emit("roomReady", {
        players: room.players
      });
      room.status = "ready";
    } else {
      socket.emit("joinError", "Ruangan tidak ditemukan!");
    }
  });

  // 2a. Start Game Synchronization
  socket.on("startGame", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      const playerCount = Object.keys(room.players).length;
      if (playerCount < 2) {
        socket.emit("startError", "Tunggu lawan masuk dulu.");
        return;
      }

      if (room.gameState === "countdown" || room.gameState === "playing") {
        return;
      }

      const startTime = Date.now();
      room.startTime = startTime;
      room.gameState = "countdown";
      
      // Generate kata yang sama untuk kedua pemain setiap match baru
      room.sharedWords = generateSharedWords();
      
      // Broadcast ke semua pemain di room untuk mulai bersamaan dengan kata yang sama
      io.to(roomCode).emit("gameStarted", { 
        startTime,
        sharedWords: room.sharedWords 
      });
      console.log(`Game started in room ${roomCode} at ${startTime}`);
    }
  });

  // Helper function untuk generate kata yang sama
  function generateSharedWords() {
    const KATA_POOL = [
      // 4 huruf
      "buku", "meja", "pena", "bola", "kuda", "sapi", "gigi", "kaki", "mata",
      "tahu", "roti", "susu", "anak", "ayah", "batu", "bumi", "daun", "emas",
      "gula", "ikan", "jari", "kayu", "kopi", "laut", "madu", "nasi", "padi",
      "raja", "satu", "tiga", "lima", "hari", "baru", "coba", "diam", "hati",
      "kuat", "lama", "maju", "naik", "atau", "tapi", "juga", "yang", "dari",
      "oleh", "pada", "akan", "jika", "bila", "maka", "lagi", "bisa", "kita",
      "saya", "kamu", "kami", "para", "saja", "atas", "baik", "baju", "bayi",
      "buah", "sama", "guru", "haus", "ikut", "jago", "jamu", "jauh", "jual",
      "kala", "kali", "kaya", "kena", "keju", "kera", "kira", "kiri", "kota",
      "labu", "laku", "lari", "lesu", "luka", "lupa", "lucu", "mana", "mati",
      "muda", "mutu", "naga", "niat", "pagi", "paha", "paku", "papa", "paus",
      "pilu", "pipi", "pita", "pula", "raba", "raga", "rasa", "ratu", "rela",
      "riba", "ribu", "rupa", "rusa", "sana", "sapu", "siap", "siku", "sini",
      "suka", "suku", "tali", "tamu", "topi", "ulat", "umat", "umum", "undi",
      "unta", "upah", "urat", "usap", "usir", "utuh", "wali", "kaca", "duka",
      // 5 huruf
      "bulan", "dalam", "sudah", "belum", "lebih", "dekat", "duduk", "harap",
      "ingat", "jawab", "kalau", "makin", "milik", "mulai", "nomor", "orang",
      "pakai", "pergi", "pikir", "sakit", "teman", "tidur", "tidak", "tiada",
      "turun", "warna", "yakin", "marah", "sedih", "takut", "benar", "salah",
      "keras", "lemah", "cepat", "bijak", "bodoh", "dapat", "darah", "depan",
    ];
    
    const pool = [...KATA_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 60);
  }

  // 2g. Sync Game Time (untuk memastikan timer sinkron)
  socket.on("syncGameTime", ({ roomCode, timeLeft }) => {
    const room = rooms[roomCode];
    if (room) {
      // Broadcast waktu ke semua pemain
      socket.to(roomCode).emit("gameSyncTime", { timeLeft });
    }
  });

  // 3. Update Progres Mengetik
  socket.on("updateProgress", ({ roomCode, wpm, accuracy, progress, score, benar, salah }) => {
    const room = rooms[roomCode];
    if (room && room.players[socket.id]) {
      room.players[socket.id].wpm = wpm;
      room.players[socket.id].accuracy = accuracy;
      room.players[socket.id].progress = progress;
      room.players[socket.id].score = score;
      room.players[socket.id].benar = benar;
      room.players[socket.id].salah = salah;

      // Broadcast progress ke pemain LAWAN
      socket.to(roomCode).emit("opponentProgress", {
        id: socket.id,
        wpm,
        accuracy,
        progress,
        score,
        benar,
        salah
      });
    }
  });

  // 4. Rematch System (Bidirectional)
  socket.on("requestRematch", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      console.log(`❌ Room ${roomCode} not found for rematch request`);
      return;
    }
    
    // Tandai bahwa socket ini request rematch
    if (!room.rematchRequests) room.rematchRequests = new Set();
    room.rematchRequests.add(socket.id);
    
    console.log(`📤 Player ${socket.id} requested rematch in room ${roomCode}`);
    console.log(`   Current requests: ${room.rematchRequests.size}/2`);
    
    // Cek apakah kedua pemain sudah request (auto-accept)
    const playerIds = Object.keys(room.players);
    if (room.rematchRequests.size === 2) {
      console.log(`✅ Both players requested rematch in room ${roomCode} - AUTO ACCEPT`);
      // Auto-accept: kedua pemain request bersamaan
      room.rematchRequests.clear();
      io.to(roomCode).emit("rematchAccepted");
    } else {
      // Hanya satu pemain yang request, beritahu lawan
      console.log(`🔔 Notifying opponent in room ${roomCode}`);
      socket.to(roomCode).emit("rematchRequested");
    }
  });

  socket.on("cancelRematch", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    // Hapus request dari set
    if (room.rematchRequests) {
      room.rematchRequests.delete(socket.id);
    }
    
    console.log(`Player ${socket.id} cancelled rematch in room ${roomCode}`);
    
    // Beritahu lawan bahwa tantangan dibatalkan
    socket.to(roomCode).emit("rematchCancelled");
  });

  socket.on("acceptRematch", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    
    console.log(`Player ${socket.id} accepted rematch in room ${roomCode}`);
    
    // Clear rematch requests
    if (room.rematchRequests) {
      room.rematchRequests.clear();
    }
    
    // Broadcast ke semua pemain untuk restart game
    io.to(roomCode).emit("rematchAccepted");
  });

  // 5. Game End Synchronization
  socket.on("gameEnded", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      room.gameState = "finished";
      room.status = "ready";
    }
    socket.to(roomCode).emit("opponentEndedGame");
  });

  // 4. Disconnect Handling
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    for (const roomCode in rooms) {
      if (rooms[roomCode].players[socket.id]) {
        // Cleanup rematch requests
        if (rooms[roomCode].rematchRequests) {
          rooms[roomCode].rematchRequests.delete(socket.id);
        }
        
        delete rooms[roomCode].players[socket.id];
        
        // Jika room kosong, hapus room
        if (Object.keys(rooms[roomCode].players).length === 0) {
          delete rooms[roomCode];
        } else {
          const wasPlaying = rooms[roomCode].gameState === "countdown" || rooms[roomCode].gameState === "playing";
          rooms[roomCode].status = "waiting";
          rooms[roomCode].gameState = "waiting";
          rooms[roomCode].sharedWords = null;
          // Beritahu lawan bahwa musuh keluar
          io.to(roomCode).emit("opponentLeft", { wasPlaying });
        }
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server is running on port ${PORT}`);
});
