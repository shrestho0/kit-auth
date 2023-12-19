-- DropIndex
DROP INDEX "TempUser_username_key";

-- AlterTable
ALTER TABLE "TempUser" ADD COLUMN "authAccessToken" TEXT;
ALTER TABLE "TempUser" ADD COLUMN "authRefreshToken" TEXT;
ALTER TABLE "TempUser" ADD COLUMN "oauthIdToken" TEXT;
