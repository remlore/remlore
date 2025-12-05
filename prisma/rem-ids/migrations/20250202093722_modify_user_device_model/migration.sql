/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `LoginHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "LoginHistory" DROP CONSTRAINT "LoginHistory_deviceId_fkey";

-- AlterTable
ALTER TABLE "LoginHistory" ALTER COLUMN "deviceId" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "photoUrl" SET DATA TYPE TEXT,
ALTER COLUMN "backgroundUrl" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hash" SET DATA TYPE TEXT,
ALTER COLUMN "googleId" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "facebookId" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "hashRt" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserDevice" ALTER COLUMN "deviceId" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "deviceType" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "LoginHistory_deviceId_key" ON "LoginHistory"("deviceId");

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "UserDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
