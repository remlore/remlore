/*
  Warnings:

  - You are about to drop the column `userId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Verify` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verifyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Verify" DROP CONSTRAINT "Verify_verifyId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- DropIndex
DROP INDEX "Verify_userId_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileId" TEXT,
ADD COLUMN     "verifyId" TEXT;

-- AlterTable
ALTER TABLE "Verify" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyId_key" ON "User"("verifyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileId_key" ON "User"("profileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verifyId_fkey" FOREIGN KEY ("verifyId") REFERENCES "Verify"("verifyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("profileId") ON DELETE SET NULL ON UPDATE CASCADE;
