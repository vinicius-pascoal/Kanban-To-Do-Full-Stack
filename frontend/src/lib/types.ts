export type Priority = 'baixa' | 'média' | 'alta';

export type CardStatus = 'overdue' | 'today' | 'ontime' | 'completed';

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
  order: number;
  history?: CardHistory[];
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
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
}

export interface CreateCardData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  columnId: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
}

export interface MoveCardData {
  cardId: string;
  targetColumnId: string;
  order?: number;
}
