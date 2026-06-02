/*
  Warnings:

  - Made the column `posterUrl` on table `Movie` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thumbUrl` on table `Movie` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "posterUrl" SET NOT NULL,
ALTER COLUMN "posterUrl" SET DATA TYPE TEXT,
ALTER COLUMN "thumbUrl" SET NOT NULL,
ALTER COLUMN "thumbUrl" SET DATA TYPE TEXT;
