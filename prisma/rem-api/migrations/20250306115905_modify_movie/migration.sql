/*
  Warnings:

  - The values [Completed,Trailer,OnGoing,Hiatus,Cancelled] on the enum `EMovieStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [TVSeries,TVShow,Movie,Anime,Ova,OneShot] on the enum `EMovieType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Country` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `addedTime` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `langsub` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `theaterMovie` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Movie` table. All the data in the column will be lost.
  - You are about to alter the column `posterUrl` on the `Movie` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - You are about to alter the column `thumbUrl` on the `Movie` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - The `quality` column on the `Movie` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_CountryToMovie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Server` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Title` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MovieToServer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originName` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_CountryToMovie` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EMovieStatus_new" AS ENUM ('complete', 'trailer', 'ongoing');
ALTER TABLE "Movie" ALTER COLUMN "status" TYPE "EMovieStatus_new" USING ("status"::text::"EMovieStatus_new");
ALTER TYPE "EMovieStatus" RENAME TO "EMovieStatus_old";
ALTER TYPE "EMovieStatus_new" RENAME TO "EMovieStatus";
DROP TYPE "EMovieStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EMovieType_new" AS ENUM ('single', 'series');
ALTER TABLE "Movie" ALTER COLUMN "type" TYPE "EMovieType_new" USING ("type"::text::"EMovieType_new");
ALTER TYPE "EMovieType" RENAME TO "EMovieType_old";
ALTER TYPE "EMovieType_new" RENAME TO "EMovieType";
DROP TYPE "EMovieType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_serverId_fkey";

-- DropForeignKey
ALTER TABLE "Title" DROP CONSTRAINT "Title_movieId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToUser" DROP CONSTRAINT "_CategoryToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToUser" DROP CONSTRAINT "_CategoryToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToMovie" DROP CONSTRAINT "_CountryToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_MovieToServer" DROP CONSTRAINT "_MovieToServer_A_fkey";

-- DropForeignKey
ALTER TABLE "_MovieToServer" DROP CONSTRAINT "_MovieToServer_B_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description",
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "slug" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "slug" SET DATA TYPE TEXT,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "addedTime",
DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "langsub",
DROP COLUMN "theaterMovie",
DROP COLUMN "year",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentEp" TEXT,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lang" TEXT DEFAULT 'Vietsub',
ADD COLUMN     "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastScraped" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "movieTheater" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(1024) NOT NULL,
ADD COLUMN     "originName" VARCHAR(1024) NOT NULL,
ADD COLUMN     "publicYear" INTEGER,
ADD COLUMN     "showTime" VARCHAR(512),
ADD COLUMN     "trailerUrl" VARCHAR(2048),
ALTER COLUMN "posterUrl" SET DATA TYPE VARCHAR(2048),
ALTER COLUMN "thumbUrl" SET DATA TYPE VARCHAR(2048),
ALTER COLUMN "totalEp" DROP NOT NULL,
ALTER COLUMN "totalEp" SET DATA TYPE TEXT,
DROP COLUMN "quality",
ADD COLUMN     "quality" TEXT DEFAULT 'HD';

-- AlterTable
ALTER TABLE "_CountryToMovie" DROP CONSTRAINT "_CountryToMovie_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_CountryToMovie_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "Server";

-- DropTable
DROP TABLE "Source";

-- DropTable
DROP TABLE "Title";

-- DropTable
DROP TABLE "_CategoryToUser";

-- DropTable
DROP TABLE "_MovieToServer";

-- DropEnum
DROP TYPE "EMovieQuality";

-- DropEnum
DROP TYPE "LangSub";

-- CreateTable
CREATE TABLE "ScrapeStatus" (
    "id" TEXT NOT NULL,
    "lastPageScraped" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScrapeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "filename" TEXT,
    "sourceEmbed" TEXT,
    "sourceM3u8" TEXT,
    "movieId" INTEGER NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Episode_movieId_serverName_slug_key" ON "Episode"("movieId", "serverName", "slug");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToMovie" ADD CONSTRAINT "_CountryToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
