import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Minimal admin settings API — single-file, small surface area to unblock TS parser
export async function GET() {
  try {
    const settings = await prisma.websiteSettings.findFirst()
    return NextResponse.json({ siteName: settings?.siteName ?? null })
  } catch (err) {
    console.error('GET website-settings error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const payload = await request.json()
    const existing = await prisma.websiteSettings.findFirst()
    const row = existing
      ? await prisma.websiteSettings.update({ where: { id: existing.id }, data: payload })
      : await prisma.websiteSettings.create({ data: payload })
    return NextResponse.json({ ok: true, id: row.id })
  } catch (err) {
    console.error('PUT website-settings error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}