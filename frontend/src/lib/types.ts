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
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  color?: string | null;
  cards: Card[];
}

export type ColumnInsertPosition = 'start' | 'end' | 'before' | 'after';

export interface CreateColumnOptions {
  position: ColumnInsertPosition;
  anchorColumnId?: string | null;
  color?: string | null;
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
