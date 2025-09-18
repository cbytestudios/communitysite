import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()
    const loginField = email || username

    if (!loginField || !password) {
      return NextResponse.json({ error: 'Email/username and password are required' }, { status: 400 })
    }

    // Find user by email or username
    const user = email
      ? await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
      : await prisma.user.findUnique({ where: { username: username! } })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if email is verified (unless it's the owner)
    if (!user.isEmailVerified && !user.isOwner) {
      return NextResponse.json({
        error: 'Please verify your email before logging in',
        needsVerification: true
      }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email || '',
      isAdmin: user.isAdmin,
      isOwner: user.isOwner
    })

    // Decide secure flag based on request protocol (supports HTTP installs behind Nginx)
    const xfProto = request.headers.get('x-forwarded-proto') || ''
    const isSecure = xfProto ? xfProto === 'https' : (process.env.SITE_URL?.startsWith('https://') ?? false)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isOwner: user.isOwner
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}