import { NextResponse } from "next/server"

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID

  if (!token || !guildId) {
    return NextResponse.json(
      { count: null, error: "Discord integration not configured" },
      { status: 200 }
    )
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
      // Prevent Next from caching this endpoint to keep it fresh
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Discord API error: ${res.status} ${text}` }, { status: 502 })
    }

    const data = await res.json()
    const count = data?.approximate_member_count ?? null
    return NextResponse.json({ count })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 })
  }
}


