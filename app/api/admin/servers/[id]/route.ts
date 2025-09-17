import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)
    const server = await prisma.gameServer.findUnique({ where: { id: params.id } })
    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    return NextResponse.json(server)
  } catch (error: any) {
    console.error('Error fetching server:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)
    const updateData = await request.json()

    if (typeof updateData.gameType === 'string') {
      const allowedTypes = [
        'fivem','redm','minecraft','rust','gmod','csgo','cs2','valorant','apex','cod','battlefield','ark','7dtd','terraria','satisfactory','valheim','palworld','other'
      ]
      const normalizedType = updateData.gameType.toLowerCase()
      updateData.gameType = allowedTypes.includes(normalizedType) ? normalizedType : 'other'
    }

    const server = await prisma.gameServer.update({
      where: { id: params.id },
      data: {
        ...updateData,
        // Ensure numbers
        port: updateData.port ? Number(updateData.port) : undefined,
        queryPort: updateData.queryPort ? Number(updateData.queryPort) : undefined,
        statLastPeakDate: updateData.statLastPeakDate ? new Date(updateData.statLastPeakDate) : undefined,
        tags: Array.isArray(updateData.tags) ? updateData.tags.join(',') : updateData.tags,
        infoRules: Array.isArray(updateData.infoRules) ? updateData.infoRules.join(',') : updateData.infoRules,
        infoMods: typeof updateData.infoMods === 'string' ? updateData.infoMods : JSON.stringify(updateData.infoMods ?? []),
      }
    })

    return NextResponse.json({ message: 'Server updated successfully', server })
  } catch (error: any) {
    console.error('Error updating server:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)
    await prisma.gameServer.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Server deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting server:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}