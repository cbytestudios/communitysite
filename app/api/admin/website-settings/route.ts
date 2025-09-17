import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get website settings (create defaults if missing)
    let settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } })
    if (!settings) {
      settings = await prisma.websiteSettings.create({ data: {} })
      settings = await prisma.websiteSettings.findFirst({ include: { galleryImages: true } }) as any
    }

    // Normalize to admin UI shape
    const normalized = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      heroTitle: settings.heroTitle,
      heroDescription: settings.heroDescription,
      heroBackgroundImage: settings.heroBackgroundImage || "",
      themeMode: settings.themeMode || 'dark',
      galleryImages: (settings.galleryImages || []).map((g: any) => ({ url: g.url, caption: g.caption, alt: g.alt })),
      socialLinks: {
        discord: settings.socialDiscord || "",
        twitter: settings.socialTwitter || "",
        youtube: settings.socialYoutube || "",
        twitch: settings.socialTwitch || "",
        steam: settings.socialSteam || "",
        facebook: settings.socialFacebook || "",
      },
      contactEmail: settings.contactEmail || "",
      colors: {
        primary: settings.colorPrimary,
        secondary: settings.colorSecondary,
        accent: settings.colorAccent,
        background: settings.colorBackground,
        surface: settings.colorSurface,
        text: settings.colorText,
        featuredServerCard: settings.colorFeaturedServerCard,
      },
      integrations: {
        discord: {
          enabled: !!settings.integrationDiscordEnabled,
          clientId: settings.integrationDiscordClientId || "",
          clientSecret: settings.integrationDiscordClientSecret || "",
          botToken: settings.integrationDiscordBotToken || "",
          guildId: settings.integrationDiscordGuildId || "",
        },
        steam: {
          enabled: !!settings.integrationSteamEnabled,
          apiKey: settings.integrationSteamApiKey || "",
        },
        google: {
          enabled: !!settings.integrationGoogleEnabled,
          clientId: settings.integrationGoogleClientId || "",
          clientSecret: settings.integrationGoogleClientSecret || "",
        },
      },
      emailSettings: {
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || "",
        smtpPassword: settings.smtpPassword || "",
        fromEmail: settings.fromEmail || "",
        fromName: settings.fromName || "",
      },
      features: {
        userRegistration: !!settings.featureUserRegistration,
        emailVerification: !!settings.featureEmailVerification,
        serverListing: !!settings.featureServerListing,
        communityForum: !!settings.featureCommunityForum,
        eventCalendar: !!settings.featureEventCalendar,
      },
      seo: {
        metaTitle: settings.seoMetaTitle || "",
        metaDescription: settings.seoMetaDescription || "",
        keywords: settings.seoKeywords || "",
        ogImage: settings.seoOgImage || "",
      },
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching website settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const updateData = await request.json()

    // Upsert single settings row
    const existing = await prisma.websiteSettings.findFirst()

    // If galleryImages is provided as an array of strings or objects, reconcile child records
    if (Array.isArray(updateData.galleryImages)) {
      const images = updateData.galleryImages
      delete updateData.galleryImages

      const settingsRow = existing
        ? await prisma.websiteSettings.update({ where: { id: existing.id }, data: updateData })
        : await prisma.websiteSettings.create({ data: updateData })

      // Reset and insert images (simple strategy for SQLite)
      await prisma.galleryImage.deleteMany({ where: { settingsId: settingsRow.id } })
      if (images.length) {
        await prisma.galleryImage.createMany({
          data: images.map((img: any) => ({
            settingsId: settingsRow.id,
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'string' ? '' : (img.caption || ''),
            alt: typeof img === 'string' ? '' : (img.alt || ''),
          }))
        })
      }

      const settings = await prisma.websiteSettings.findUnique({ where: { id: settingsRow.id }, include: { galleryImages: true } })
      return NextResponse.json({ message: 'Website settings updated successfully', settings })
    }

    // De-normalize admin payload into Prisma fields
    const payload = { ...updateData }

    // Social links
    if (payload.socialLinks) {
      payload.socialDiscord = payload.socialLinks.discord || ""
      payload.socialTwitter = payload.socialLinks.twitter || ""
      payload.socialYoutube = payload.socialLinks.youtube || ""
      payload.socialTwitch = payload.socialLinks.twitch || ""
      payload.socialSteam = payload.socialLinks.steam || ""
      payload.socialFacebook = payload.socialLinks.facebook || ""
      delete payload.socialLinks
    }

    // Colors
    if (payload.colors) {
      payload.colorPrimary = payload.colors.primary
      payload.colorSecondary = payload.colors.secondary
      payload.colorAccent = payload.colors.accent
      payload.colorBackground = payload.colors.background
      payload.colorSurface = payload.colors.surface
      payload.colorText = payload.colors.text
      if (payload.colors.featuredServerCard) payload.colorFeaturedServerCard = payload.colors.featuredServerCard
      delete payload.colors
    }

    // Integrations
    if (payload.integrations) {
      payload.integrationDiscordEnabled = !!payload.integrations.discord?.enabled
      payload.integrationDiscordClientId = payload.integrations.discord?.clientId || ""
      payload.integrationDiscordClientSecret = payload.integrations.discord?.clientSecret || ""
      payload.integrationDiscordBotToken = payload.integrations.discord?.botToken || ""
      payload.integrationDiscordGuildId = payload.integrations.discord?.guildId || ""

      payload.integrationSteamEnabled = !!payload.integrations.steam?.enabled
      payload.integrationSteamApiKey = payload.integrations.steam?.apiKey || ""

      payload.integrationGoogleEnabled = !!payload.integrations.google?.enabled
      payload.integrationGoogleClientId = payload.integrations.google?.clientId || ""
      payload.integrationGoogleClientSecret = payload.integrations.google?.clientSecret || ""

      delete payload.integrations
    }

    // Email settings
    if (payload.emailSettings) {
      payload.smtpHost = payload.emailSettings.smtpHost || ""
      payload.smtpPort = payload.emailSettings.smtpPort || 587
      payload.smtpUser = payload.emailSettings.smtpUser || ""
      payload.smtpPassword = payload.emailSettings.smtpPassword || ""
      payload.fromEmail = payload.emailSettings.fromEmail || ""
      payload.fromName = payload.emailSettings.fromName || ""
      delete payload.emailSettings
    }

    // Features
    if (payload.features) {
      payload.featureUserRegistration = !!payload.features.userRegistration
      payload.featureEmailVerification = !!payload.features.emailVerification
      payload.featureServerListing = !!payload.features.serverListing
      payload.featureCommunityForum = !!payload.features.communityForum
      payload.featureEventCalendar = !!payload.features.eventCalendar
      delete payload.features
    }

    // SEO
    if (payload.seo) {
      payload.seoMetaTitle = payload.seo.metaTitle || ""
      payload.seoMetaDescription = payload.seo.metaDescription || ""
      payload.seoKeywords = payload.seo.keywords || ""
      payload.seoOgImage = payload.seo.ogImage || ""
      delete payload.seo
    }

    // Upsert base row

    // Handle gallery separately if present
    let gallery = updateData.galleryImages
    if (gallery) delete payload.galleryImages

    const settingsRow = existing
      ? await prisma.websiteSettings.update({ where: { id: existing.id }, data: payload })
      : await prisma.websiteSettings.create({ data: payload })

    if (Array.isArray(gallery)) {
      await prisma.galleryImage.deleteMany({ where: { settingsId: settingsRow.id } })
      if (gallery.length) {
        await prisma.galleryImage.createMany({
          data: gallery.map((img: any) => ({
            settingsId: settingsRow.id,
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'string' ? '' : (img.caption || ''),
            alt: typeof img === 'string' ? '' : (img.alt || ''),
          }))
        })
      }
    }

    const settings = await prisma.websiteSettings.findUnique({ where: { id: settingsRow.id }, include: { galleryImages: true } })
    return NextResponse.json({ message: 'Website settings updated successfully', settings })
  } catch (error: any) {
    console.error('Error updating website settings:', error)
    if (error?.message === 'Authentication required' || error?.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}