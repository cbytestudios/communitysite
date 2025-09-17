import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const totalUsers = await prisma.user.count()
  return NextResponse.json({ total: totalUsers })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
