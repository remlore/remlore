/*
  Warnings:

  - You are about to drop the `OidcClient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OidcGrant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OidcSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OidcClient";

-- DropTable
DROP TABLE "OidcGrant";

-- DropTable
DROP TABLE "OidcSession";

-- CreateTable
CREATE TABLE "oidc" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "grantId" TEXT,
    "userCode" TEXT,
    "uid" TEXT,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oidc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oidc_uid_key" ON "oidc"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "oidc_id_type_key" ON "oidc"("id", "type");
