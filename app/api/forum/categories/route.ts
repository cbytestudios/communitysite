import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// GET: list categories with permissions
export async function GET() {
  try {
    let settings = await prisma.websiteSettings.findFirst()
    if (!settings) settings = await prisma.websiteSettings.create({ data: {} })
    const categories = await prisma.forumCategory.findMany({
      where: { settingsId: settings.id },
      orderBy: { sortOrder: 'asc' },
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
    let settings = await prisma.websiteSettings.findFirst()
    if (!settings) settings = await prisma.websiteSettings.create({ data: {} })

    const categories = Array.isArray(body?.categories) ? body.categories : []

    // Upsert categories and permissions; delete removed ones
    await prisma.$transaction(async (tx) => {
      const existing = await tx.forumCategory.findMany({ where: { settingsId: settings.id }, select: { id: true } })
      const existingIds = new Set(existing.map(c => c.id))
      const incomingIds = new Set<string>()

      for (const cat of categories) {
        const perms = Array.isArray(cat.permissions) ? cat.permissions : []
        if (cat.id && existingIds.has(cat.id)) {
          incomingIds.add(cat.id)
          await tx.forumCategory.update({
            where: { id: cat.id },
            data: {
              name: cat.name || 'Untitled',
              description: cat.description || '',
              sortOrder: typeof cat.sortOrder === 'number' ? cat.sortOrder : 0,
            }
          })
          await tx.forumCategoryPermission.deleteMany({ where: { categoryId: cat.id } })
          if (perms.length) {
            await tx.forumCategoryPermission.createMany({
              data: perms.map((p: any) => ({
                categoryId: cat.id,
                role: p.role || 'guest',
                canView: !!p.canView,
                canPost: !!p.canPost,
                canReply: !!p.canReply,
                canModerate: !!p.canModerate,
              }))
            })
          }
        } else {
          const created = await tx.forumCategory.create({
            data: {
              settingsId: settings.id,
              name: cat.name || 'Untitled',
              description: cat.description || '',
              sortOrder: typeof cat.sortOrder === 'number' ? cat.sortOrder : 0,
            }
          })
          incomingIds.add(created.id)
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
      }

      // Delete categories that were removed
      const toDelete = [...existingIds].filter(id => !incomingIds.has(id))
      if (toDelete.length) {
        await tx.forumCategoryPermission.deleteMany({ where: { categoryId: { in: toDelete } } })
        await tx.forumCategory.deleteMany({ where: { id: { in: toDelete } } })
      }
    })

    const refreshed = await prisma.forumCategory.findMany({ where: { settingsId: settings.id }, orderBy: { sortOrder: 'asc' }, include: { permissions: true } })
    return NextResponse.json({ categories: refreshed })
  } catch (e: any) {
    if (e?.message === 'Authentication required' || e?.message === 'Admin access required') {
      return NextResponse.json({ error: e.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to save categories' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'