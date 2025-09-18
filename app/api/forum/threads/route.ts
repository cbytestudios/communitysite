import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

function roleFor(user: any) {
  if (user?.isOwner || user?.isAdmin) return 'admin'
  if (user?.id) return 'member'
  return 'guest'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const where: any = {}
    if (categoryId) where.categoryId = categoryId

    const threads = await prisma.forumThread.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true, isLocked: true, isPinned: true, categoryId: true }
    })
    return NextResponse.json({ threads })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load threads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const body = await req.json()
    const { title, content, categoryId } = body || {}
    if (!title || !categoryId) return NextResponse.json({ error: 'Missing title or categoryId' }, { status: 400 })

    // Permission check
    const category = await prisma.forumCategory.findUnique({ where: { id: categoryId }, include: { permissions: true } })
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

    const r = roleFor(user)
    const perm = category.permissions.find(p => p.role === r) || category.permissions.find(p => p.role === 'guest')
    const canPost = perm ? perm.canPost : false
    if (!canPost) return NextResponse.json({ error: 'Not allowed to post in this category' }, { status: 403 })

    const created = await prisma.forumThread.create({
      data: {
        title: String(title).slice(0, 200),
        content: String(content || '').slice(0, 10000),
        categoryId,
        authorId: user?.id || null,
      },
      select: { id: true }
    })

    return NextResponse.json({ id: created.id })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'