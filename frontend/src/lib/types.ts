export type Priority = 'baixa' | 'média' | 'alta';

export type CardStatus = 'overdue' | 'today' | 'ontime' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  user: User;
  createdAt: string;
  // Perfil
  isOwner: boolean;
  // Permissões de Card
  canCreateCard: boolean;
  canEditCard: boolean;
  canRemoveCard: boolean;
  // Permissões de Coluna
  canCreateColumn: boolean;
  canEditColumn: boolean;
  canRemoveColumn: boolean;
  // Permissões de Time
  canAddMember: boolean;
  canRemoveMember: boolean;
  canRenameTeam: boolean;
  // Permissões de Visualização
  canViewMetrics: boolean;
  canManageTags: boolean;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  boards: Board[];
}

export interface CardHistory {
  id: string;
  cardId: string;
  from: string;
  to: string;
  movedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  authorId: string;
  author: { id: string; name: string; email: string };
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  columnId: string;
  assignedToId?: string | null;
  assignedTo?: User | null;
  order: number;
  history?: CardHistory[];
  tags?: Tag[];
  comments?: Comment[];
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  color?: string | null;
  isCompleted?: boolean;
  cards: Card[];
}

export type ColumnInsertPosition = 'start' | 'end' | 'before' | 'after';

export interface CreateColumnOptions {
  position: ColumnInsertPosition;
  anchorColumnId?: string | null;
  color?: string | null;
  isCompleted?: boolean;
}

export interface Board {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
  columns: Column[];
}

export interface Metrics {
  totalCards: number;
  cardsByColumn: { name: string; count: number }[];
  overdueCount: number;
  dueTodayCount: number;
  completedCount: number;
  avgTimeByColumn: { columnName: string; avgTimeInHours: number }[];
  completedByDay: { date: string; count: number }[];
  completedCards: { date: string; title: string }[];
  memberProductivity: {
    name: string;
    cardsCreated: number;
    cardsCompleted: number;
    cardsInProgress: number;
    averageTimeToComplete: number;
  }[];
}

export interface CreateCardData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  columnId: string;
  assignedToId?: string | null;
}

export interface UpdateCardData {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  assignedToId?: string | null;
}

export interface MoveCardData {
  cardId: string;
  targetColumnId: string;
  order?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
