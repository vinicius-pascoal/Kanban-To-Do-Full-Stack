import { CardStatus } from './types';

export const isOverdue = (dueDate: string | null | undefined): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export const isDueToday = (dueDate: string | null | undefined): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
};

export const getCardStatus = (
  dueDate: string | null | undefined,
  columnName: string
): CardStatus => {
  if (columnName === 'Concluído') return 'completed';
  if (isOverdue(dueDate)) return 'overdue';
  if (isDueToday(dueDate)) return 'today';
  return 'ontime';
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('pt-BR');
};

export const getDaysUntilDue = (dueDate: string | null | undefined): number | null => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getStatusColor = (status: CardStatus): string => {
  switch (status) {
    case 'overdue':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'today':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'alta':
      return 'text-red-600 bg-red-100';
    case 'média':
      return 'text-yellow-600 bg-yellow-100';
    case 'baixa':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
