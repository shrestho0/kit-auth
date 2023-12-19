/*
  Warnings:

  - You are about to drop the column `accessToken` on the `OauthCredentials` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createAt", "email", "id", "name", "passwordHash", "updateAt", "username") SELECT "createAt", "email", "id", "name", "passwordHash", "updateAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_OauthCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "oauthRefreshToken" TEXT,
    "oauthLastTokenRefreshed" DATETIME,
    "userId" TEXT NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_OauthCredentials" ("createAt", "id", "oauthLastTokenRefreshed", "oauthRefreshToken", "provider", "refreshToken", "updateAt", "userId") SELECT "createAt", "id", "oauthLastTokenRefreshed", "oauthRefreshToken", "provider", "refreshToken", "updateAt", "userId" FROM "OauthCredentials";
DROP TABLE "OauthCredentials";
ALTER TABLE "new_OauthCredentials" RENAME TO "OauthCredentials";
CREATE UNIQUE INDEX "OauthCredentials_refreshToken_key" ON "OauthCredentials"("refreshToken");
CREATE UNIQUE INDEX "OauthCredentials_oauthRefreshToken_key" ON "OauthCredentials"("oauthRefreshToken");
CREATE INDEX "OauthCredentials_userId_idx" ON "OauthCredentials"("userId");
CREATE INDEX "OauthCredentials_refreshToken_idx" ON "OauthCredentials"("refreshToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
