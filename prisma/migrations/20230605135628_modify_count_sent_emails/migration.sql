/*
  Warnings:

  - You are about to drop the column `count` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "count",
ADD COLUMN     "countSentEmails" INTEGER NOT NULL DEFAULT 0;
