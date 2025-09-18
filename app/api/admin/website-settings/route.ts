import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Minimal admin settings API — single-file, small surface area to unblock TS parser
export async function GET() {
  try {
    const settings = await prisma.websiteSettings.findFirst()
    return NextResponse.json({ siteName: settings?.siteName ?? null })
  } catch (err) {
    console.error('GET website-settings error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const payload = await request.json()
    
    // Transform nested objects to flat fields
    const flatData = {
      siteName: payload.siteName,
      siteDescription: payload.siteDescription,
      heroTitle: payload.heroTitle,
      heroDescription: payload.heroDescription,
      heroBackgroundImage: payload.heroBackgroundImage,
      themeMode: payload.themeMode,
      
      // Social links
      socialDiscord: payload.socialLinks?.discord || '',
      socialTwitter: payload.socialLinks?.twitter || '',
      socialYoutube: payload.socialLinks?.youtube || '',
      socialTwitch: payload.socialLinks?.twitch || '',
      socialSteam: payload.socialLinks?.steam || '',
      socialFacebook: payload.socialLinks?.facebook || '',
      
      // Colors
      colorPrimary: payload.colors?.primary || '#FFC107',
      colorSecondary: payload.colors?.secondary || '#4FC3F7',
      colorAccent: payload.colors?.accent || '#8BC34A',
      colorBackground: payload.colors?.background || '#1A1A1A',
      colorSurface: payload.colors?.surface || '#2D2D2D',
      colorText: payload.colors?.text || '#FFFFFF',
      colorFeaturedServerCard: payload.colors?.featuredServerCard || '#3a3a3c',
      
      // Features
      featureUserRegistration: payload.features?.userRegistration ?? true,
      featureEmailVerification: payload.features?.emailVerification ?? true,
      featureServerListing: payload.features?.serverListing ?? true,
      featureCommunityForum: payload.features?.communityForum ?? false,
      featureEventCalendar: payload.features?.eventCalendar ?? false,

      // Contact
      contactEmail: payload.contactEmail || '',

      // Assets
      assetLogoUrl: payload.assets?.logoUrl || '',
      assetFaviconUrl: payload.assets?.faviconUrl || ''
    }

    const existing = await prisma.websiteSettings.findFirst()
    const row = existing
      ? await prisma.websiteSettings.update({ where: { id: existing.id }, data: flatData })
      : await prisma.websiteSettings.create({ data: flatData })

    return NextResponse.json({ ok: true, id: row.id })
  } catch (err) {
    console.error('PUT website-settings error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}