/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `TempUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TempUser" ADD COLUMN "oauthAccessToken" TEXT;
ALTER TABLE "TempUser" ADD COLUMN "oauthRefreshToken" TEXT;
ALTER TABLE "TempUser" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TempUser_username_key" ON "TempUser"("username");
