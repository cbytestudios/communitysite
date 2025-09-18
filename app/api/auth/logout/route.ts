import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    // Decide secure flag based on request protocol (supports HTTP installs behind Nginx)
    const xfProto = request.headers.get('x-forwarded-proto') || ''
    const isSecure = xfProto ? xfProto === 'https' : (process.env.SITE_URL?.startsWith('https://') ?? false)

    const cookieStore = await cookies()
    cookieStore.set('auth-token', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })
    
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}