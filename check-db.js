import Database from "better-sqlite3";

const db = new Database("typetug.db");

console.log("\n=== USERS IN DATABASE ===\n");

const users = db.prepare("SELECT id, username, email, avatar_url FROM users").all();

if (users.length === 0) {
  console.log("No users found in database.");
} else {
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Avatar URL: ${user.avatar_url || "(null)"}`);
    console.log("---");
  });
}

console.log(`\nTotal users: ${users.length}\n`);

db.close();
