-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OauthCredentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerEmail" TEXT NOT NULL,
    "passwordHash" TEXT,
    "refreshToken" TEXT NOT NULL,
    "oauthRefreshToken" TEXT,
    "oauthLastTokenRefreshed" DATETIME,
    "userId" TEXT NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TempUser" (
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

-- CreateTable
CREATE TABLE "TempData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "deviceFingerprint" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RefreshTokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updateAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OauthCredentials_refreshToken_key" ON "OauthCredentials"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "OauthCredentials_oauthRefreshToken_key" ON "OauthCredentials"("oauthRefreshToken");

-- CreateIndex
CREATE INDEX "OauthCredentials_provider_providerEmail_idx" ON "OauthCredentials"("provider", "providerEmail");

-- CreateIndex
CREATE INDEX "OauthCredentials_userId_idx" ON "OauthCredentials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OauthCredentials_provider_providerEmail_key" ON "OauthCredentials"("provider", "providerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "TempUser_email_key" ON "TempUser"("email");

-- CreateIndex
CREATE INDEX "TempUser_email_idx" ON "TempUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_refreshToken_key" ON "RefreshTokens"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_userId_key" ON "RefreshTokens"("userId");

-- CreateIndex
CREATE INDEX "RefreshTokens_userId_idx" ON "RefreshTokens"("userId");

-- CreateIndex
CREATE INDEX "RefreshTokens_refreshToken_idx" ON "RefreshTokens"("refreshToken");
