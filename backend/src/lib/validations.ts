import { z } from 'zod';

export const createCardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['baixa', 'média', 'alta']),
  dueDate: z.string().optional().nullable(),
  columnId: z.string().cuid(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['baixa', 'média', 'alta']).optional(),
  dueDate: z.string().optional().nullable(),
  columnId: z.string().cuid().optional(),
});

export const moveCardSchema = z.object({
  cardId: z.string().cuid(),
  targetColumnId: z.string().cuid(),
  order: z.number().optional(),
});

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Nome do board é obrigatório'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
