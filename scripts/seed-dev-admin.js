/*
  Auto-seed a hidden dev admin when running in development.
  This runs automatically via npm predev script.
*/
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DEV_USER = process.env.DEV_ADMIN_USER || 'devadmin'
const DEV_EMAIL = process.env.DEV_ADMIN_EMAIL || 'devadmin@example.com'
const DEV_PASS = process.env.DEV_ADMIN_PASS || 'devpassword123'

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Seed skipped in production')
    return
  }
  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: DEV_USER }, { email: DEV_EMAIL }] }
    })
    if (existing) {
      console.log('Dev admin already exists — skipping')
      return
    }
    const hashed = await bcrypt.hash(DEV_PASS, 12)
    await prisma.user.create({
      data: {
        username: DEV_USER,
        email: DEV_EMAIL,
        password: hashed,
        isAdmin: true,
        isOwner: true,
        isEmailVerified: true,
      }
    })
    console.log('✅ Dev admin created:', DEV_USER, DEV_EMAIL)
  } catch (e) {
    console.error('Seed error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()