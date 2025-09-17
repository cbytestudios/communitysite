-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "profilePicture" TEXT,
    "discordId" TEXT,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "isDiscordConnected" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebsiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Community Website',
    "siteDescription" TEXT NOT NULL DEFAULT 'A multi-game community platform',
    "heroTitle" TEXT NOT NULL DEFAULT 'Welcome to Our Gaming Community',
    "heroDescription" TEXT NOT NULL DEFAULT 'Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.',
    "heroBackgroundImage" TEXT,
    "socialDiscord" TEXT DEFAULT '',
    "socialTwitter" TEXT DEFAULT '',
    "socialYoutube" TEXT DEFAULT '',
    "socialTwitch" TEXT DEFAULT '',
    "socialSteam" TEXT DEFAULT '',
    "socialFacebook" TEXT DEFAULT '',
    "contactEmail" TEXT DEFAULT '',
    "colorPrimary" TEXT NOT NULL DEFAULT '#FFC107',
    "colorSecondary" TEXT NOT NULL DEFAULT '#4FC3F7',
    "colorAccent" TEXT NOT NULL DEFAULT '#8BC34A',
    "colorBackground" TEXT NOT NULL DEFAULT '#1A1A1A',
    "colorSurface" TEXT NOT NULL DEFAULT '#2D2D2D',
    "colorText" TEXT NOT NULL DEFAULT '#FFFFFF',
    "colorFeaturedServerCard" TEXT NOT NULL DEFAULT '#3a3a3c',
    "assetLogoUrl" TEXT DEFAULT '',
    "assetFaviconUrl" TEXT DEFAULT '',
    "integrationDiscordEnabled" BOOLEAN NOT NULL DEFAULT false,
    "integrationDiscordClientId" TEXT DEFAULT '',
    "integrationDiscordClientSecret" TEXT DEFAULT '',
    "integrationDiscordBotToken" TEXT DEFAULT '',
    "integrationDiscordGuildId" TEXT DEFAULT '',
    "integrationSteamEnabled" BOOLEAN NOT NULL DEFAULT false,
    "integrationSteamApiKey" TEXT DEFAULT '',
    "integrationGoogleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "integrationGoogleClientId" TEXT DEFAULT '',
    "integrationGoogleClientSecret" TEXT DEFAULT '',
    "smtpHost" TEXT DEFAULT '',
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUser" TEXT DEFAULT '',
    "smtpPassword" TEXT DEFAULT '',
    "fromEmail" TEXT DEFAULT '',
    "fromName" TEXT DEFAULT '',
    "featureUserRegistration" BOOLEAN NOT NULL DEFAULT true,
    "featureEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "featureServerListing" BOOLEAN NOT NULL DEFAULT true,
    "featureCommunityForum" BOOLEAN NOT NULL DEFAULT false,
    "featureEventCalendar" BOOLEAN NOT NULL DEFAULT false,
    "seoMetaTitle" TEXT DEFAULT '',
    "seoMetaDescription" TEXT DEFAULT '',
    "seoKeywords" TEXT DEFAULT '',
    "seoOgImage" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "caption" TEXT DEFAULT '',
    "alt" TEXT DEFAULT '',
    "settingsId" TEXT NOT NULL,
    CONSTRAINT "GalleryImage_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "WebsiteSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameServer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 30120,
    "queryPort" INTEGER,
    "gameType" TEXT NOT NULL DEFAULT 'other',
    "gameVersion" TEXT NOT NULL DEFAULT '',
    "connectUrl" TEXT NOT NULL DEFAULT '',
    "serverImage" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "maxPlayers" INTEGER NOT NULL DEFAULT 32,
    "ping" INTEGER NOT NULL DEFAULT 0,
    "uptime" INTEGER NOT NULL DEFAULT 0,
    "lastChecked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "infoMap" TEXT NOT NULL DEFAULT '',
    "infoGameMode" TEXT NOT NULL DEFAULT '',
    "infoWebsite" TEXT NOT NULL DEFAULT '',
    "infoDiscord" TEXT NOT NULL DEFAULT '',
    "infoRules" TEXT NOT NULL DEFAULT '',
    "infoMods" TEXT NOT NULL DEFAULT '',
    "statTotalConnections" INTEGER NOT NULL DEFAULT 0,
    "statPeakPlayers" INTEGER NOT NULL DEFAULT 0,
    "statAveragePlaytime" INTEGER NOT NULL DEFAULT 0,
    "statLastPeakDate" DATETIME,
    "adminAutoUpdate" BOOLEAN NOT NULL DEFAULT true,
    "adminQueryInterval" INTEGER NOT NULL DEFAULT 60,
    "adminAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "adminMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "money" INTEGER NOT NULL,
    "job" TEXT NOT NULL,
    "lastSynced" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_playerId_key" ON "GamePlayer"("playerId");
