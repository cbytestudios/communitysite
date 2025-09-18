import { NextResponse } from 'next/server'

// Initiates Discord OAuth by redirecting the user to Discord authorization URL
export async function GET(request: Request) {
  // Load from WebsiteSettings (admin-managed)
  const base = await (await import('@/lib/models/WebsiteSettings')).WebsiteSettings.findOne()
  const discord = base?.integrations?.discord || {}
  const clientId = discord.clientId

  // Compute redirect URI dynamically from request URL
  const url = new URL(request.url)
  const redirectUri = `${url.origin}/api/discord/callback`

  if (!clientId) {
    return NextResponse.json(
      { error: 'Discord OAuth not configured in Admin > Website Settings' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify email',
    prompt: 'consent',
  })

  const authorizeUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`
  return NextResponse.redirect(authorizeUrl)
}