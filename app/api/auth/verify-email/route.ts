import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token, emailVerificationExpires: { gt: new Date() } }
    })
    if (!user) return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null }
    })

    return NextResponse.json({ message: 'Email verified successfully! You can now log in.' })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token, emailVerificationExpires: { gt: new Date() } }
    })
    if (!user) return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null }
    })

    return NextResponse.json({ message: 'Email verified successfully! You can now log in.', username: user.username })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}