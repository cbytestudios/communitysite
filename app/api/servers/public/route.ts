import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get only public servers that are not in maintenance mode
    const servers = await prisma.gameServer.findMany({
      where: {
        isPublic: true,
        adminMaintenanceMode: false,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { playerCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching public servers:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'