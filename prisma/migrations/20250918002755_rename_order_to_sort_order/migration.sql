/*
  Warnings:

  - You are about to drop the column `order` on the `ForumCategory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForumCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "settingsId" TEXT NOT NULL,
    CONSTRAINT "ForumCategory_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "WebsiteSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ForumCategory" ("description", "id", "name", "settingsId") SELECT "description", "id", "name", "settingsId" FROM "ForumCategory";
DROP TABLE "ForumCategory";
ALTER TABLE "new_ForumCategory" RENAME TO "ForumCategory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
