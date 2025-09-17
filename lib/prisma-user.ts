import bcrypt from 'bcryptjs'
import prisma from './prisma'

// Helper to hash password if present
export async function createUser(data: {
  username: string
  email?: string | null
  password?: string | null
  emailVerificationToken?: string | null
  emailVerificationExpires?: Date | null
  isEmailVerified?: boolean
}) {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : null
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email?.toLowerCase() ?? null,
      password: hashedPassword,
      emailVerificationToken: data.emailVerificationToken ?? null,
      emailVerificationExpires: data.emailVerificationExpires ?? null,
      isEmailVerified: data.isEmailVerified ?? false,
    },
    select: {
      id: true,
      username: true,
      email: true,
    }
  })
}

export async function findUserByEmailOrUsername(email: string, username: string) {
  // Try email first
  const byEmail = await prisma.user.findUnique({ where: { email } })
  if (byEmail) return byEmail
  // Fallback username
  return prisma.user.findUnique({ where: { username } })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}