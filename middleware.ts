import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null
    }
    
    return decoded
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value
    console.log('Middleware - admin route, token found:', !!token)
    console.log('Middleware - token value:', token ? token.substring(0, 20) + '...' : 'none')

    if (!token) {
      console.log('Middleware - no token, redirecting to login')
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }

    const user = decodeJWT(token)
    console.log('Middleware - decoded user:', user ? { id: user.id, username: user.username, isAdmin: user.isAdmin, isOwner: user.isOwner } : null)
    
    if (!user || (!user.isAdmin && !user.isOwner)) {
      console.log('Middleware - user not admin/owner or invalid token, redirecting')
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }
    
    console.log('Middleware - admin access granted')
  }

  // Protect API admin routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = decodeJWT(token)
    if (!user || (!user.isAdmin && !user.isOwner)) {
      return NextResponse.json({ error: 'Invalid token or insufficient permissions' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}