import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    const port = searchParams.get('port')

    if (!ip || !port) {
      return NextResponse.json({ error: 'IP and port are required' }, { status: 400 })
    }

    // Simple ping simulation - in a real implementation, you'd ping the actual server
    const start = Date.now()
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    
    const ping = Date.now() - start

    return NextResponse.json({ 
      success: true, 
      ping,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Ping failed:', error)
    return NextResponse.json({ 
      error: 'Ping failed',
      success: false 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'