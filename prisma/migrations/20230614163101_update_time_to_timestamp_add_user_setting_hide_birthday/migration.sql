-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hideBirthDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "setting" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "story" TEXT,
ALTER COLUMN "createdAt" DROP DEFAULT;
