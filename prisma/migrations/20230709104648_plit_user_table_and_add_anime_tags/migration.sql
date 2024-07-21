/*
  Warnings:

  - The primary key for the `Anime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `brithday` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `countSentEmails` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `favorite` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashRt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashVerify` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isRemLoreAccount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rem_loreUsername` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `setting` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `story` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[animeId]` on the table `Anime` will be added. If there are existing duplicate values, this will fail.
  - The required column `animeId` was added to the `Anime` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Anime_id_key";

-- DropIndex
DROP INDEX "Comment_commentId_key";

-- DropIndex
DROP INDEX "Post_postId_key";

-- DropIndex
DROP INDEX "Reaction_id_key";

-- DropIndex
DROP INDEX "User_rem_loreUsername_key";

-- DropIndex
DROP INDEX "User_userId_key";

-- AlterTable
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_pkey",
DROP COLUMN "id",
ADD COLUMN     "animeId" TEXT NOT NULL,
ADD CONSTRAINT "Anime_pkey" PRIMARY KEY ("animeId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "backgroundUrl",
DROP COLUMN "brithday",
DROP COLUMN "countSentEmails",
DROP COLUMN "displayName",
DROP COLUMN "favorite",
DROP COLUMN "hashRt",
DROP COLUMN "hashVerify",
DROP COLUMN "isRemLoreAccount",
DROP COLUMN "photoUrl",
DROP COLUMN "rem_loreUsername",
DROP COLUMN "setting",
DROP COLUMN "story",
DROP COLUMN "verified";

-- CreateTable
CREATE TABLE "Profile" (
    "profileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rem_loreUsername" TEXT,
    "displayName" TEXT,
    "photoUrl" TEXT,
    "backgroundUrl" TEXT,
    "story" TEXT,
    "setting" JSONB NOT NULL DEFAULT '{}',
    "brithday" TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "Verify" (
    "verifyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashRt" TEXT,
    "hashVerify" TEXT,
    "countSentEmails" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isRemLoreAccount" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Verify_pkey" PRIMARY KEY ("verifyId")
);

-- CreateTable
CREATE TABLE "AnimeTag" (
    "animeTagId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AnimeTag_pkey" PRIMARY KEY ("animeTagId")
);

-- CreateTable
CREATE TABLE "_AnimeToAnimeTag" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AnimeTagToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_rem_loreUsername_key" ON "Profile"("rem_loreUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Verify_userId_key" ON "Verify"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeTag_slug_key" ON "AnimeTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_AnimeToAnimeTag_AB_unique" ON "_AnimeToAnimeTag"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimeToAnimeTag_B_index" ON "_AnimeToAnimeTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AnimeTagToUser_AB_unique" ON "_AnimeTagToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimeTagToUser_B_index" ON "_AnimeTagToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_animeId_key" ON "Anime"("animeId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verify" ADD CONSTRAINT "Verify_verifyId_fkey" FOREIGN KEY ("verifyId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToAnimeTag" ADD CONSTRAINT "_AnimeToAnimeTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("animeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToAnimeTag" ADD CONSTRAINT "_AnimeToAnimeTag_B_fkey" FOREIGN KEY ("B") REFERENCES "AnimeTag"("animeTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeTagToUser" ADD CONSTRAINT "_AnimeTagToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "AnimeTag"("animeTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeTagToUser" ADD CONSTRAINT "_AnimeTagToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
