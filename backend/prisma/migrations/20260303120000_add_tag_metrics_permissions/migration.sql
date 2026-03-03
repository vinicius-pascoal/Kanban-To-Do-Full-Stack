-- AlterTable: add canViewMetrics and canManageTags to TeamMember
ALTER TABLE "TeamMember" ADD COLUMN "canViewMetrics" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TeamMember" ADD COLUMN "canManageTags"  BOOLEAN NOT NULL DEFAULT false;
