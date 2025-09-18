import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Admin Website Settings API: returns normalized object and accepts nested payloads
export async function GET() {
  try {
    let settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } })
    if (!settings) {
      settings = await prisma.websiteSettings.create({ data: {} })
      settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } })
    }

    const s: any = settings
    const normalized = {
      siteName: s.siteName,
      siteDescription: s.siteDescription,
      heroTitle: s.heroTitle,
      heroDescription: s.heroDescription,
      heroBackgroundImage: s.heroBackgroundImage || '',
      themeMode: s.themeMode || 'dark',

      // Relations exposed as simple objects
      galleryImages: (s.galleryImages || []).map((g: any) => ({ url: g.url, caption: g.caption, alt: g.alt })),

      socialLinks: {
        discord: s.socialDiscord || '',
        twitter: s.socialTwitter || '',
        youtube: s.socialYoutube || '',
        twitch: s.socialTwitch || '',
        steam: s.socialSteam || '',
        facebook: s.socialFacebook || '',
      },

      contactEmail: s.contactEmail || '',

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
        logoUrl: s.assetLogoUrl || '',
        faviconUrl: s.assetFaviconUrl || '',
      },

      integrations: {
        discord: {
          enabled: !!s.integrationDiscordEnabled,
          clientId: s.integrationDiscordClientId || '',
          clientSecret: s.integrationDiscordClientSecret || '',
          botToken: s.integrationDiscordBotToken || '',
          guildId: s.integrationDiscordGuildId || '',
        },
        steam: {
          enabled: !!s.integrationSteamEnabled,
          apiKey: s.integrationSteamApiKey || '',
        },
        google: {
          enabled: !!s.integrationGoogleEnabled,
          clientId: s.integrationGoogleClientId || '',
          clientSecret: s.integrationGoogleClientSecret || '',
        },
      },

      emailSettings: {
        smtpHost: s.smtpHost || '',
        smtpPort: s.smtpPort || 587,
        smtpUser: s.smtpUser || '',
        smtpPassword: s.smtpPassword || '',
        fromEmail: s.fromEmail || '',
        fromName: s.fromName || '',
      },

      features: {
        userRegistration: !!s.featureUserRegistration,
        emailVerification: !!s.featureEmailVerification,
        serverListing: !!s.featureServerListing,
        communityForum: !!s.featureCommunityForum,
        eventCalendar: !!s.featureEventCalendar,
      },

      seo: {
        metaTitle: s.seoMetaTitle || '',
        metaDescription: s.seoMetaDescription || '',
        keywords: s.seoKeywords || '',
        ogImage: s.seoOgImage || '',
      },
    }

    return NextResponse.json(normalized)
  } catch (err) {
    console.error('GET website-settings error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const payload = await request.json()

    // Transform nested objects to flat fields for Prisma
    const flatData: any = {
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
      assetFaviconUrl: payload.assets?.faviconUrl || '',

      // Integrations
      integrationDiscordEnabled: payload.integrations?.discord?.enabled ?? false,
      integrationDiscordClientId: payload.integrations?.discord?.clientId || '',
      integrationDiscordClientSecret: payload.integrations?.discord?.clientSecret || '',
      integrationDiscordBotToken: payload.integrations?.discord?.botToken || '',
      integrationDiscordGuildId: payload.integrations?.discord?.guildId || '',

      integrationSteamEnabled: payload.integrations?.steam?.enabled ?? false,
      integrationSteamApiKey: payload.integrations?.steam?.apiKey || '',

      integrationGoogleEnabled: payload.integrations?.google?.enabled ?? false,
      integrationGoogleClientId: payload.integrations?.google?.clientId || '',
      integrationGoogleClientSecret: payload.integrations?.google?.clientSecret || '',

      // Email
      smtpHost: payload.emailSettings?.smtpHost || '',
      smtpPort: payload.emailSettings?.smtpPort ?? 587,
      smtpUser: payload.emailSettings?.smtpUser || '',
      smtpPassword: payload.emailSettings?.smtpPassword || '',
      fromEmail: payload.emailSettings?.fromEmail || '',
      fromName: payload.emailSettings?.fromName || '',

      // SEO
      seoMetaTitle: payload.seo?.metaTitle || '',
      seoMetaDescription: payload.seo?.metaDescription || '',
      seoKeywords: payload.seo?.keywords || '',
      seoOgImage: payload.seo?.ogImage || '',
    }

    // NOTE: galleryImages are managed via dedicated upload endpoints; ignore raw arrays here

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