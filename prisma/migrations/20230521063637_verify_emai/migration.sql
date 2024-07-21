/*
  Warnings:

  - You are about to drop the column `verifyRem_lore` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verifyRem_lore",
ADD COLUMN     "backgroundUrl" TEXT,
ADD COLUMN     "hashVerify" TEXT,
ADD COLUMN     "isRemLoreAccount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "displayName" DROP NOT NULL;
