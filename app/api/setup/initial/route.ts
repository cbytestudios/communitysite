import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const ownerCount = await prisma.user.count({ where: { isOwner: true } })
    return NextResponse.json({ needsSetup: ownerCount === 0 })
  } catch (error) {
    console.error('Setup check failed:', error)
    return NextResponse.json({ error: 'Setup check failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ownerCount = await prisma.user.count({ where: { isOwner: true } })
    if (ownerCount > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 })
    }

    const { username, email, password, siteName, siteDescription } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const created = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashed,
        isOwner: true,
        isAdmin: true,
        isEmailVerified: true,
      }
    })

    await prisma.websiteSettings.create({
      data: {
        siteName: siteName || 'Community Website',
        siteDescription: siteDescription || 'A multi-game community platform',
        contactEmail: email,
      }
    })

    const token = generateToken({
      id: created.id,
      username: created.username,
      email: created.email || '',
      isAdmin: created.isAdmin,
      isOwner: created.isOwner,
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return NextResponse.json({
      message: 'Initial setup completed successfully',
      token,
      user: {
        id: created.id,
        username: created.username,
        email: created.email,
        isOwner: created.isOwner,
        isAdmin: created.isAdmin,
      }
    })

  } catch (error) {
    console.error('Initial setup failed:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Setup failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'