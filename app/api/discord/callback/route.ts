import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// Handles Discord OAuth callback: exchanges code for tokens, fetches profile, persists to user
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  // Load from WebsiteSettings (admin-managed)
  const base = await (await import('@/lib/models/WebsiteSettings')).WebsiteSettings.findOne()
  const discord = (base as any)?.integrations?.discord || {}
  const clientId = discord.clientId
  const clientSecret = discord.clientSecret
  const redirectUri = `${new URL(request.url).origin}/api/discord/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Discord OAuth not configured in Admin > Website Settings' },
      { status: 500 }
    )
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      return NextResponse.json({ error: `Token exchange failed: ${tokenRes.status} ${text}` }, { status: 502 })
    }

    const tokenData = await tokenRes.json()

    // Fetch user identity
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: 'no-store',
    })

    if (!userRes.ok) {
      const text = await userRes.text()
      return NextResponse.json({ error: `User fetch failed: ${userRes.status} ${text}` }, { status: 502 })
    }

    const discordUser = await userRes.json()
    const discordId = String(discordUser.id)
    const discordUsername = `${discordUser.username}${discordUser.discriminator && discordUser.discriminator !== '0' ? '#' + discordUser.discriminator : ''}`
    const discordAvatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null

    // Identify current app user (via auth cookie)
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Persist to the current user record
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        discordId,
        discordUsername,
        discordAvatar,
        isDiscordConnected: true,
        updatedAt: new Date(),
      },
    })

    // Redirect back to profile page after linking
    return NextResponse.redirect(new URL('/profile', request.url))
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}