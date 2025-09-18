import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Read public website settings from Prisma; create defaults if missing
    let settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } })
    if (!settings) {
      // create may not include galleryImages in the returned type; cast to any
      settings = (await prisma.websiteSettings.create({ data: {} })) as any
      settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } }) as any
    }

    // Normalize response to match ThemeSettingsApplier expectations and expose public feature flags
    const s = settings as any // ensure TS knows it's present and has galleryImages
    const normalized = {
      ...s,
      colors: {
        primary: s.colorPrimary,
        secondary: s.colorSecondary,
        accent: s.colorAccent,
        background: s.colorBackground,
        surface: s.colorSurface,
        text: s.colorText,
        featuredServerCard: s.colorFeaturedServerCard,
      },
      assets: {
        logoUrl: s.assetLogoUrl,
        faviconUrl: s.assetFaviconUrl,
      },
      socialLinks: {
        discord: s.socialDiscord || "",
        twitter: s.socialTwitter || "",
        youtube: s.socialYoutube || "",
        twitch: s.socialTwitch || "",
        steam: s.socialSteam || "",
        facebook: s.socialFacebook || "",
      },
      features: {
        serverListing: !!s.featureServerListing,
        communityForum: !!s.featureCommunityForum,
        eventCalendar: !!s.featureEventCalendar,
      },
      themeMode: s.themeMode || 'dark',
      galleryImages: (s.galleryImages || []).map((g: any) => ({ url: g.url, caption: g.caption, alt: g.alt })),
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching website settings:', error)
    return NextResponse.json({ error: 'Failed to fetch website settings' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'