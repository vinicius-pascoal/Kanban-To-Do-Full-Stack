export const isOverdue = (dueDate: Date | null): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export const isDueToday = (dueDate: Date | null): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
};

export const getCardStatus = (dueDate: Date | null, columnName: string): 'overdue' | 'today' | 'ontime' | 'completed' => {
  if (columnName === 'Concluído') return 'completed';
  if (isOverdue(dueDate)) return 'overdue';
  if (isDueToday(dueDate)) return 'today';
  return 'ontime';
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDaysUntilDue = (dueDate: Date | null): number | null => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Converte string de data no formato YYYY-MM-DD para Date
 * Sem offset de timezone (sempre usa noon UTC)
 */
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};
