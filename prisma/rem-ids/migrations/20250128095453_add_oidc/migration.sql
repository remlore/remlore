/*
  Warnings:

  - You are about to alter the column `hash` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `hashRt` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- CreateEnum
CREATE TYPE "EGender" AS ENUM ('Male', 'Female', 'Other');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hash" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "hashRt" SET DATA TYPE VARCHAR(500);

-- CreateTable
CREATE TABLE "OidcSession" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "consumed" TIMESTAMP(3),

    CONSTRAINT "OidcSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OidcGrant" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "OidcGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OidcClient" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "OidcClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "displayName" VARCHAR(100),
    "photoUrl" VARCHAR(500),
    "backgroundUrl" VARCHAR(500),
    "bio" VARCHAR(400),
    "setting" JSONB NOT NULL DEFAULT '{}',
    "birthday" TIMESTAMP,
    "gender" "EGender",
    "updatedTime" TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
