-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT,
ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "twoFactorBackupCodes" JSONB,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateIndex
CREATE INDEX "User_resetTokenHash_idx" ON "User"("resetTokenHash");
