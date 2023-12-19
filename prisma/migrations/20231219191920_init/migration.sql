-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OauthCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerEmail" TEXT NOT NULL,
    "passwordHash" TEXT,
    "refreshToken" TEXT,
    "oauthRefreshToken" TEXT,
    "oauthLastTokenRefreshed" DATETIME,
    "userId" TEXT NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_OauthCredentials" ("createAt", "id", "oauthLastTokenRefreshed", "oauthRefreshToken", "passwordHash", "provider", "providerEmail", "refreshToken", "updateAt", "userId") SELECT "createAt", "id", "oauthLastTokenRefreshed", "oauthRefreshToken", "passwordHash", "provider", "providerEmail", "refreshToken", "updateAt", "userId" FROM "OauthCredentials";
DROP TABLE "OauthCredentials";
ALTER TABLE "new_OauthCredentials" RENAME TO "OauthCredentials";
CREATE UNIQUE INDEX "OauthCredentials_oauthRefreshToken_key" ON "OauthCredentials"("oauthRefreshToken");
CREATE INDEX "OauthCredentials_provider_providerEmail_idx" ON "OauthCredentials"("provider", "providerEmail");
CREATE INDEX "OauthCredentials_userId_idx" ON "OauthCredentials"("userId");
CREATE UNIQUE INDEX "OauthCredentials_provider_providerEmail_key" ON "OauthCredentials"("provider", "providerEmail");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
