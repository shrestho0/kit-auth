/*
  Warnings:

  - You are about to drop the column `oauthLastTokenRefreshed` on the `OauthCredentials` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OauthCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerEmail" TEXT NOT NULL,
    "passwordHash" TEXT,
    "oauthRefreshToken" TEXT,
    "userId" TEXT NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_OauthCredentials" ("createAt", "id", "oauthRefreshToken", "passwordHash", "provider", "providerEmail", "updateAt", "userId") SELECT "createAt", "id", "oauthRefreshToken", "passwordHash", "provider", "providerEmail", "updateAt", "userId" FROM "OauthCredentials";
DROP TABLE "OauthCredentials";
ALTER TABLE "new_OauthCredentials" RENAME TO "OauthCredentials";
CREATE UNIQUE INDEX "OauthCredentials_oauthRefreshToken_key" ON "OauthCredentials"("oauthRefreshToken");
CREATE INDEX "OauthCredentials_provider_providerEmail_idx" ON "OauthCredentials"("provider", "providerEmail");
CREATE INDEX "OauthCredentials_userId_idx" ON "OauthCredentials"("userId");
CREATE UNIQUE INDEX "OauthCredentials_provider_providerEmail_key" ON "OauthCredentials"("provider", "providerEmail");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
