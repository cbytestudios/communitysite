import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { sendEmail, generateVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
      return NextResponse.json({ message: 'If an account with that email exists and is not verified, we have sent a verification link.' })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'This email is already verified. You can sign in now.' }, { status: 400 })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken, emailVerificationExpires: verificationExpires }
    })

    const verificationUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
    const emailContent = generateVerificationEmail(user.username, verificationUrl)

    const emailResult = await sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html })
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'If an account with that email exists and is not verified, we have sent a verification link.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}