import Database from "better-sqlite3";

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

export default db;
