import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { GameServer } from '@/lib/models/GameServer'

export async function GET() {
  try {
    await connectDB()
    
    // Get all public servers and sum their player counts
    const servers = await GameServer.find({ isPublic: true, isOnline: true })
    
    const totalPlayers = servers.reduce((sum, server) => sum + (server.playerCount || 0), 0)
    const totalMaxPlayers = servers.reduce((sum, server) => sum + (server.maxPlayers || 0), 0)

    return NextResponse.json({ 
      count: totalPlayers,
      maxPlayers: totalMaxPlayers,
      servers: servers.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to fetch player data:', error)
    return NextResponse.json({ 
      count: 0,
      maxPlayers: 0,
      servers: 0,
      error: 'Failed to fetch player data'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'