/*
  Warnings:

  - The primary key for the `XP` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `XP` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[xpId]` on the table `XP` will be added. If there are existing duplicate values, this will fail.
  - Made the column `updatedAt` on table `Anime` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Made the column `updatedAt` on table `Reaction` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `xpId` to the `XP` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "XP_userId_key";

-- AlterTable
ALTER TABLE "Anime" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "XP" DROP CONSTRAINT "XP_pkey",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "xpId" TEXT NOT NULL,
ADD CONSTRAINT "XP_pkey" PRIMARY KEY ("xpId");

-- CreateIndex
CREATE UNIQUE INDEX "XP_xpId_key" ON "XP"("xpId");
