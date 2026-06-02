/*
  Warnings:

  - Added the required column `userAgent` to the `UserDevice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserDevice" ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userAgent" TEXT NOT NULL,
ALTER COLUMN "deviceType" SET DATA TYPE VARCHAR(200);
