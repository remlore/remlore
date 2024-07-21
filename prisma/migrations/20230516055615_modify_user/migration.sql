/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hashRt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "brithday" TIMESTAMP(3),
ADD COLUMN     "favorite" TEXT,
ADD COLUMN     "verifyRem_lore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "hashRt" SET NOT NULL;
