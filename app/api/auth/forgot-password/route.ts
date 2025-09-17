import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always respond 200 to avoid user enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account with that email exists, we have sent a password reset link.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpires: resetExpires }
    })

    const resetUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    const emailContent = generatePasswordResetEmail(user.username, resetUrl)

    const emailResult = await sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html })
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send reset email. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'If an account with that email exists, we have sent a password reset link.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}