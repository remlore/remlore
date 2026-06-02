/*
  Warnings:

  - A unique constraint covering the columns `[scrapeId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scrapeId` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "scrapeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_scrapeId_key" ON "Movie"("scrapeId");
