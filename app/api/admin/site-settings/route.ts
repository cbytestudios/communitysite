import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst()
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Community Website',
          heroImages: ['/images/hero-1.jpg','/images/hero-2.jpg','/images/hero-3.jpg'],
          heroTitle: 'Welcome to Our Community',
          heroSubtitle: 'Join our amazing gaming community',
          discordInvite: '',
          socialLinks: { discord: '', twitter: '', youtube: '', twitch: '' } as any,
        }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    const existing = await prisma.siteSettings.findFirst()
    const settings = existing
      ? await prisma.siteSettings.update({ where: { id: existing.id }, data: { ...body } })
      : await prisma.siteSettings.create({ data: { ...body } })

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error('Error updating site settings:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}