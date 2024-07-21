/*
  Warnings:

  - You are about to drop the column `hideBirthDay` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ERole" AS ENUM ('Admin', 'User', 'Guest');

-- CreateEnum
CREATE TYPE "EAchievement" AS ENUM ('LV22', 'OneYear', 'ThreeYear', 'Longly');

-- CreateEnum
CREATE TYPE "EReaction" AS ENUM ('Like', 'Dislike', 'Haha', 'Love', 'Sad', 'Angry');

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hideBirthDay",
DROP COLUMN "xp",
ADD COLUMN     "achievement" "EAchievement",
ADD COLUMN     "role" "ERole" NOT NULL DEFAULT 'Guest';

-- CreateTable
CREATE TABLE "XP" (
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "XP_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Anime" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EReaction" NOT NULL,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XP_userId_key" ON "XP"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_id_key" ON "Anime"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_slug_key" ON "Anime"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_postId_key" ON "Post"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_id_key" ON "Reaction"("id");

-- AddForeignKey
ALTER TABLE "XP" ADD CONSTRAINT "XP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("postId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
