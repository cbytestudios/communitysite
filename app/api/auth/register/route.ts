import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { createUser, findUserByEmailOrUsername } from '@/lib/prisma-user'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await findUserByEmailOrUsername(email.toLowerCase(), username)
    if (existingUser) {
      const isEmailMatch = existingUser.email && existingUser.email.toLowerCase() === email.toLowerCase()
      return NextResponse.json({ 
        error: isEmailMatch ? 'Email already registered' : 'Username already taken' 
      }, { status: 400 })
    }

    // Decide verification strategy based on SMTP configuration in settings
    const settings = await prisma.websiteSettings.findFirst()
    const smtpConfigured = Boolean(settings?.smtpHost && settings?.smtpUser)

    let emailVerificationToken: string | null = null
    let emailVerificationExpires: Date | null = null
    let isEmailVerified = false

    if (smtpConfigured) {
      // Generate email verification token (24h)
      emailVerificationToken = crypto.randomBytes(32).toString('hex')
      emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      isEmailVerified = false
    } else {
      // Auto-verify when SMTP isn't configured so users can login
      isEmailVerified = true
    }

    // Create new user (hashing handled in helper)
    const user = await createUser({
      username,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified,
    })

    // TODO: Send verification email if smtpConfigured

    return NextResponse.json({
      message: smtpConfigured
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful! Email verification is skipped until SMTP is configured.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}