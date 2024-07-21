/*
  Warnings:

  - A unique constraint covering the columns `[rem_loreUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rem_loreUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_rem_loreUsername_key" ON "User"("rem_loreUsername");
