import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  username: string
  email: string
  isAdmin: boolean
  isOwner: boolean
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded) return null

    // Verify user still exists and get fresh data
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return null

    return {
      id: user.id,
      username: user.username,
      email: user.email || '',
      isAdmin: user.isAdmin,
      isOwner: user.isOwner
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (!user.isAdmin && !user.isOwner) {
    throw new Error('Admin access required')
  }
  return user
}

export async function requireOwner(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (!user.isOwner) {
    throw new Error('Owner access required')
  }
  return user
}