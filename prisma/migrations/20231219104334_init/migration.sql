/*
  Warnings:

  - Made the column `provider` on table `TempUser` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TempUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "provider" TEXT NOT NULL,
    "authAccessToken" TEXT,
    "authRefreshToken" TEXT,
    "deviceFingerprint" TEXT,
    "oauthIdToken" TEXT,
    "oauthAccessToken" TEXT,
    "oauthRefreshToken" TEXT,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TempUser" ("authAccessToken", "authRefreshToken", "createAt", "deviceFingerprint", "email", "id", "name", "oauthAccessToken", "oauthIdToken", "oauthRefreshToken", "provider", "username") SELECT "authAccessToken", "authRefreshToken", "createAt", "deviceFingerprint", "email", "id", "name", "oauthAccessToken", "oauthIdToken", "oauthRefreshToken", "provider", "username" FROM "TempUser";
DROP TABLE "TempUser";
ALTER TABLE "new_TempUser" RENAME TO "TempUser";
CREATE UNIQUE INDEX "TempUser_email_key" ON "TempUser"("email");
CREATE INDEX "TempUser_email_idx" ON "TempUser"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
