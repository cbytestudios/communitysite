import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// GET: list categories with permissions
export async function GET() {
  try {
    const settings = await prisma.websiteSettings.findFirst()
    if (!settings) return NextResponse.json({ categories: [] })
    const categories = await prisma.forumCategory.findMany({
      where: { settingsId: settings.id },
      orderBy: { order: 'asc' },
      include: { permissions: true },
    })
    return NextResponse.json({ categories })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}

// PUT: replace categories+permissions (simple autosave-friendly)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const settings = await prisma.websiteSettings.findFirst()
    if (!settings) return NextResponse.json({ error: 'Settings not initialized' }, { status: 400 })

    const categories = Array.isArray(body?.categories) ? body.categories : []

    // Wipe and recreate for simplicity; okay for small sets and autosave
    await prisma.$transaction(async (tx) => {
      const existing = await tx.forumCategory.findMany({ where: { settingsId: settings.id }, select: { id: true } })
      if (existing.length) {
        await tx.forumCategoryPermission.deleteMany({ where: { categoryId: { in: existing.map(c => c.id) } } })
        await tx.forumThread.deleteMany({ where: { categoryId: { in: existing.map(c => c.id) } } })
        await tx.forumCategory.deleteMany({ where: { settingsId: settings.id } })
      }

      for (const cat of categories) {
        const created = await tx.forumCategory.create({
          data: {
            settingsId: settings.id,
            name: cat.name || 'Untitled',
            description: cat.description || '',
            order: typeof cat.order === 'number' ? cat.order : 0,
          }
        })
        const perms = Array.isArray(cat.permissions) ? cat.permissions : []
        if (perms.length) {
          await tx.forumCategoryPermission.createMany({
            data: perms.map((p: any) => ({
              categoryId: created.id,
              role: p.role || 'guest',
              canView: !!p.canView,
              canPost: !!p.canPost,
              canReply: !!p.canReply,
              canModerate: !!p.canModerate,
            }))
          })
        }
      }
    })

    const refreshed = await prisma.forumCategory.findMany({ where: { settingsId: settings.id }, orderBy: { order: 'asc' }, include: { permissions: true } })
    return NextResponse.json({ categories: refreshed })
  } catch (e: any) {
    if (e?.message === 'Authentication required' || e?.message === 'Admin access required') {
      return NextResponse.json({ error: e.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to save categories' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'