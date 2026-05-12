const Database = require('better-sqlite3');
const db = new Database('dev.db');
const row = db.prepare('SELECT id, name, email, password FROM "User" WHERE email = ?').get('admin@example.com');
console.log(row);
db.close();