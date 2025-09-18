import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { WebsiteSettings } from '@/lib/models/WebsiteSettings'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { to, subject, text } = await request.json()
    
    // Get email settings from database
    const settings = await WebsiteSettings.findOne()
    if (!settings?.emailSettings?.smtpHost) {
      return NextResponse.json({ error: 'Email settings not configured' }, { status: 400 })
    }

    const { emailSettings } = settings

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      secure: emailSettings.smtpPort === 465,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword
      }
    })

    // Send test email
    await transporter.sendMail({
      from: `"${emailSettings.fromName}" <${emailSettings.fromEmail}>`,
      to,
      subject,
      text
    })

    return NextResponse.json({ message: 'Test email sent successfully' })

  } catch (error) {
    console.error('Email test failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send test email' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'