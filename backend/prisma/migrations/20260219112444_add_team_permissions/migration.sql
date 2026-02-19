-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "canAddMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canCreateCard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canCreateColumn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEditCard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEditColumn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRemoveCard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRemoveColumn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRemoveMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRenameTeam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;
