/*
  Warnings:

  - The values [complete] on the enum `EMovieStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EMovieStatus_new" AS ENUM ('completed', 'trailer', 'ongoing');
ALTER TABLE "Movie" ALTER COLUMN "status" TYPE "EMovieStatus_new" USING ("status"::text::"EMovieStatus_new");
ALTER TYPE "EMovieStatus" RENAME TO "EMovieStatus_old";
ALTER TYPE "EMovieStatus_new" RENAME TO "EMovieStatus";
DROP TYPE "EMovieStatus_old";
COMMIT;
