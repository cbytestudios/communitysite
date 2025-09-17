import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const servers = await prisma.gameServer.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(servers)
  } catch (error: any) {
    console.error('Error fetching servers:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const serverData = await request.json()

    if (!serverData.name || !serverData.ip || !serverData.port) {
      return NextResponse.json({ error: 'Name, IP, and port are required' }, { status: 400 })
    }

    const allowedTypes = [
      'fivem','redm','minecraft','rust','gmod','csgo','cs2','valorant','apex','cod','battlefield','ark','7dtd','terraria','satisfactory','valheim','palworld','other'
    ]
    const normalizedType = typeof serverData.gameType === 'string' ? serverData.gameType.toLowerCase() : 'other'
    const gameType = allowedTypes.includes(normalizedType) ? normalizedType : 'other'

    const existingServer = await prisma.gameServer.findFirst({ where: { ip: serverData.ip, port: serverData.port } })
    if (existingServer) {
      return NextResponse.json({ error: 'Server with this IP and port already exists' }, { status: 400 })
    }

    const server = await prisma.gameServer.create({
      data: {
        name: serverData.name,
        description: serverData.description ?? '',
        ip: serverData.ip,
        port: Number(serverData.port),
        queryPort: serverData.queryPort ? Number(serverData.queryPort) : null,
        gameType,
        gameVersion: serverData.gameVersion ?? '',
        connectUrl: serverData.connectUrl ?? '',
        serverImage: serverData.serverImage ?? '',
        tags: Array.isArray(serverData.tags) ? serverData.tags.join(',') : (serverData.tags ?? ''),
        isPublic: serverData.isPublic ?? true,
        isFeatured: serverData.isFeatured ?? false,
        isOnline: serverData.isOnline ?? false,
        playerCount: serverData.playerCount ?? 0,
        maxPlayers: serverData.maxPlayers ?? 32,
        ping: serverData.ping ?? 0,
        uptime: serverData.uptime ?? 0,
        lastChecked: new Date(),
        infoMap: serverData.infoMap ?? '',
        infoGameMode: serverData.infoGameMode ?? '',
        infoWebsite: serverData.infoWebsite ?? '',
        infoDiscord: serverData.infoDiscord ?? '',
        infoRules: Array.isArray(serverData.infoRules) ? serverData.infoRules.join(',') : (serverData.infoRules ?? ''),
        infoMods: typeof serverData.infoMods === 'string' ? serverData.infoMods : JSON.stringify(serverData.infoMods ?? []),
        statTotalConnections: serverData.statTotalConnections ?? 0,
        statPeakPlayers: serverData.statPeakPlayers ?? 0,
        statAveragePlaytime: serverData.statAveragePlaytime ?? 0,
        statLastPeakDate: serverData.statLastPeakDate ? new Date(serverData.statLastPeakDate) : null,
        adminAutoUpdate: serverData.adminAutoUpdate ?? true,
        adminQueryInterval: serverData.adminQueryInterval ?? 60,
        adminAlertsEnabled: serverData.adminAlertsEnabled ?? true,
        adminMaintenanceMode: serverData.adminMaintenanceMode ?? false,
      }
    })

    return NextResponse.json({ message: 'Server created successfully', server })
  } catch (error: any) {
    console.error('Error creating server:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}