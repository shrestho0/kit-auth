/*
  Warnings:

  - Made the column `refreshToken` on table `OauthCredentials` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OauthCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT,
    "provider" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "oauthRefreshToken" TEXT,
    "oauthLastTokenRefreshed" DATETIME,
    "userId" TEXT NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_OauthCredentials" ("accessToken", "createAt", "id", "provider", "refreshToken", "updateAt", "userId") SELECT "accessToken", "createAt", "id", "provider", "refreshToken", "updateAt", "userId" FROM "OauthCredentials";
DROP TABLE "OauthCredentials";
ALTER TABLE "new_OauthCredentials" RENAME TO "OauthCredentials";
CREATE UNIQUE INDEX "OauthCredentials_refreshToken_key" ON "OauthCredentials"("refreshToken");
CREATE UNIQUE INDEX "OauthCredentials_oauthRefreshToken_key" ON "OauthCredentials"("oauthRefreshToken");
CREATE INDEX "OauthCredentials_userId_idx" ON "OauthCredentials"("userId");
CREATE INDEX "OauthCredentials_refreshToken_idx" ON "OauthCredentials"("refreshToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
