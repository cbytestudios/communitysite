import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Read public website settings from Prisma; create defaults if missing
    let settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } })
    if (!settings) {
      settings = await prisma.websiteSettings.create({ data: {} })
      settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } }) as any
    }

    // Normalize response to match ThemeSettingsApplier expectations
    const normalized = {
      ...settings,
      colors: {
        primary: settings.colorPrimary,
        secondary: settings.colorSecondary,
        accent: settings.colorAccent,
        background: settings.colorBackground,
        surface: settings.colorSurface,
        text: settings.colorText,
        featuredServerCard: settings.colorFeaturedServerCard,
      },
      assets: {
        logoUrl: settings.assetLogoUrl,
        faviconUrl: settings.assetFaviconUrl,
      },
      socialLinks: {
        discord: settings.socialDiscord || "",
        twitter: settings.socialTwitter || "",
        youtube: settings.socialYoutube || "",
        twitch: settings.socialTwitch || "",
        steam: settings.socialSteam || "",
        facebook: settings.socialFacebook || "",
      },
      themeMode: settings.themeMode || 'dark',
      galleryImages: (settings.galleryImages || []).map((g: any) => ({ url: g.url, caption: g.caption, alt: g.alt })),
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching website settings:', error)
    return NextResponse.json({ error: 'Failed to fetch website settings' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'