const Database = require('better-sqlite3');
const db = new Database('dev.db');
const stmt = db.prepare('UPDATE "User" SET password = ? WHERE email = ?');
const result = stmt.run('$2b$10$Wcm9ApXvgNgcgwDhrYjH5ei0JcbNw/2duJcdeUk5XBzdXoohJsOJ.', 'admin@example.com');
console.log('Updated rows:', result.changes);
db.close();