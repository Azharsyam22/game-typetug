import Database from "better-sqlite3";

const db = new Database("typetug.db");

console.log("\n=== FIXING MISSING AVATARS ===\n");

// Set default avatar untuk user yang tidak punya avatar_url
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=C08030&color=fff&size=96";

const usersWithoutAvatar = db.prepare("SELECT id, username, email FROM users WHERE avatar_url IS NULL").all();

if (usersWithoutAvatar.length === 0) {
  console.log("✅ All users already have avatars!");
} else {
  console.log(`Found ${usersWithoutAvatar.length} user(s) without avatar:\n`);
  
  const updateStmt = db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
  
  usersWithoutAvatar.forEach(user => {
    // Generate avatar berdasarkan username
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=C08030&color=fff&size=96`;
    updateStmt.run(avatarUrl, user.id);
    console.log(`✅ Updated avatar for: ${user.username} (${user.email})`);
  });
  
  console.log(`\n✅ Fixed ${usersWithoutAvatar.length} user(s)!`);
}

// Show all users
console.log("\n=== ALL USERS ===\n");
const allUsers = db.prepare("SELECT id, username, email, avatar_url FROM users").all();
allUsers.forEach(user => {
  console.log(`${user.username}: ${user.avatar_url}`);
});

console.log("\n");

db.close();
