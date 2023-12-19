/*
  Warnings:

  - You are about to drop the column `data` on the `TempData` table. All the data in the column will be lost.
  - You are about to drop the column `deviceFingerprint` on the `TempData` table. All the data in the column will be lost.
  - Added the required column `jsonStr` to the `TempData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TempData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jsonStr" TEXT NOT NULL
);
INSERT INTO "new_TempData" ("id") SELECT "id" FROM "TempData";
DROP TABLE "TempData";
ALTER TABLE "new_TempData" RENAME TO "TempData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
