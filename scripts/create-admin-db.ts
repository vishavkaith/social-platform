import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database('./dev.db')

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10)

    // Check if admin user already exists
    const stmt = db.prepare('SELECT * FROM "User" WHERE email = ?')
    const existingUser = stmt.get('admin@example.com')

    if (existingUser) {
      console.log('Admin user already exists!')
      db.close()
      process.exit(0)
      return
    }

    // Create the admin user
    const insertStmt = db.prepare(
      'INSERT INTO "User" (name, email, password, "createdAt") VALUES (?, ?, ?, ?)'
    )
    const now = new Date().toISOString()
    const result = insertStmt.run('Admin', 'admin@example.com', hashedPassword, now)

    console.log('Admin user created successfully!')
    console.log('Email: admin@example.com')
    console.log('Password: admin')
    console.log('User ID:', result.lastInsertRowid)
    
    db.close()
    process.exit(0)

  } catch (error) {
    console.error('Error creating admin user:', error)
    db.close()
    process.exit(1)
  }
}

createAdminUser()
