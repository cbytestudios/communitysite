-- CreateTable
CREATE TABLE "ForumCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "settingsId" TEXT NOT NULL,
    CONSTRAINT "ForumCategory_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "WebsiteSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT,
    "categoryId" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForumThread_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForumCategoryPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canPost" BOOLEAN NOT NULL DEFAULT true,
    "canReply" BOOLEAN NOT NULL DEFAULT true,
    "canModerate" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ForumCategoryPermission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
