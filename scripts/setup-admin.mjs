import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: 'file:./dev.db',
  }),
})

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10)

    // Check if admin user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com'
      }
    })

    if (existingUser) {
      console.log('✓ Admin user already exists!')
      console.log('Email: admin@example.com')
      console.log('Password: admin')
      console.log('User ID:', existingUser.id)
      process.exit(0)
      return
    }

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
      }
    })

    console.log('✓ Admin user created successfully!')
    console.log('Email: admin@example.com')
    console.log('Password: admin')
    console.log('User ID:', adminUser.id)
    process.exit(0)

  } catch (error) {
    console.error('✗ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
