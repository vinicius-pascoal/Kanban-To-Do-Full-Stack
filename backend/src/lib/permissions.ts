import prisma from './prisma';
import { Response } from 'express';

export type Permission =
  | 'canCreateCard'
  | 'canEditCard'
  | 'canRemoveCard'
  | 'canCreateColumn'
  | 'canEditColumn'
  | 'canRemoveColumn'
  | 'canAddMember'
  | 'canRemoveMember'
  | 'canRenameTeam';

/**
 * Busca o TeamMember de um usuário em um time.
 */
export async function getTeamMember(userId: string, teamId: string) {
  return prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
}

/**
 * Resolve o teamId a partir de um cardId (Card → Column → Board → Team).
 */
export async function getTeamIdFromCard(cardId: string): Promise<string | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: {
          board: { select: { teamId: true } },
        },
      },
    },
  });
  return card?.column?.board?.teamId ?? null;
}

/**
 * Resolve o teamId a partir de um columnId (Column → Board → Team).
 */
export async function getTeamIdFromColumn(columnId: string): Promise<string | null> {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: { select: { teamId: true } },
    },
  });
  return column?.board?.teamId ?? null;
}

/**
 * Verifica se o usuário tem a permissão necessária em um time.
 * Donos (isOwner) sempre têm todas as permissões.
 * Retorna false se não for membro.
 */
export async function hasPermission(
  userId: string,
  teamId: string,
  permission: Permission,
): Promise<boolean> {
  const member = await getTeamMember(userId, teamId);
  if (!member) return false;
  if (member.isOwner) return true;
  return member[permission] === true;
}

/**
 * Envia 403 e retorna false se o usuário não tiver a permissão.
 * Use como guard em rotas: if (!await checkPermission(...)) return;
 */
export async function checkPermission(
  userId: string,
  teamId: string,
  permission: Permission,
  res: Response,
): Promise<boolean> {
  const ok = await hasPermission(userId, teamId, permission);
  if (!ok) {
    res.status(403).json({ error: 'Você não tem permissão para realizar esta ação.' });
    return false;
  }
  return true;
}

/**
 * Conjunto completo de permissões (para o criador do time).
 */
export const ALL_PERMISSIONS = {
  isOwner: true,
  canCreateCard: true,
  canEditCard: true,
  canRemoveCard: true,
  canCreateColumn: true,
  canEditColumn: true,
  canRemoveColumn: true,
  canAddMember: true,
  canRemoveMember: true,
  canRenameTeam: true,
};

/**
 * Permissões padrão para novo membro (sem acesso).
 */
export const DEFAULT_MEMBER_PERMISSIONS = {
  isOwner: false,
  canCreateCard: false,
  canEditCard: false,
  canRemoveCard: false,
  canCreateColumn: false,
  canEditColumn: false,
  canRemoveColumn: false,
  canAddMember: false,
  canRemoveMember: false,
  canRenameTeam: false,
};
