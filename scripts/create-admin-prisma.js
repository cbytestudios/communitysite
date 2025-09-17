/*
  Create or update an initial admin/owner user using Prisma (SQLite).
  Usage:
    node scripts/create-admin-prisma.js
*/
require('dotenv').config()
const readline = require('readline')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))

async function main() {
  try {
    console.log('\n=== Create Admin (Prisma/SQLite) ===')

    const username = (await ask('Username: ')).trim()
    const email = (await ask('Email: ')).trim().toLowerCase()
    const password = (await ask('Password (min 6 chars): ')).trim()

    if (!username || username.length < 3) throw new Error('Username must be at least 3 chars')
    if (!email || !email.includes('@')) throw new Error('Valid email required')
    if (!password || password.length < 6) throw new Error('Password must be at least 6 chars')

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })
    if (existing) throw new Error('User with same username or email already exists')

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        isAdmin: true,
        isOwner: true,
        isEmailVerified: true,
      },
      select: { id: true, username: true, email: true, isAdmin: true, isOwner: true }
    })

    console.log('\n✅ Admin created:')
    console.log(user)
  } catch (err) {
    console.error('Error:', err.message || err)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

main()