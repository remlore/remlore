/*
  Warnings:

  - A unique constraint covering the columns `[scrapeId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[scrapeId]` on the table `Country` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "scrapeId" TEXT;

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "scrapeId" TEXT;

-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "scrapeId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_scrapeId_key" ON "Category"("scrapeId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_scrapeId_key" ON "Country"("scrapeId");
