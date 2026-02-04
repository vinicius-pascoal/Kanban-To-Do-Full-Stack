import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createCardSchema, updateCardSchema, moveCardSchema } from '../lib/validations';
import { parseDateString } from '../lib/date-utils';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';

const router = Router();

// POST /api/card - Criar novo card
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createCardSchema.parse(req.body);

    // Contar cards na coluna para definir a ordem
    const cardsInColumn = await prisma.card.count({
      where: { columnId: validatedData.columnId },
    });

    // Parse date string to avoid timezone offset issues
    let dueDate: Date | null = null;
    if (validatedData.dueDate) {
      dueDate = parseDateString(validatedData.dueDate);
    }

    const card = await prisma.card.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        priority: validatedData.priority,
        dueDate: dueDate,
        columnId: validatedData.columnId,
        assignedToId: validatedData.assignedToId || null,
        order: cardsInColumn,
      },
      include: {
        column: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Erro ao criar card:', error);
    res.status(400).json({ error: 'Erro ao criar card' });
  }
});

// GET /api/card/:id - Buscar card específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        column: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        history: {
          orderBy: { movedAt: 'desc' },
        },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado' });
    }

    res.json(card);
  } catch (error) {
    console.error('Erro ao buscar card:', error);
    res.status(500).json({ error: 'Erro ao buscar card' });
  }
});

// PUT /api/card/:id - Atualizar card
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateCardSchema.parse(req.body);

    const updateData: any = {};

    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priority) updateData.priority = validatedData.priority;
    if (validatedData.dueDate !== undefined) {
      if (validatedData.dueDate) {
        updateData.dueDate = parseDateString(validatedData.dueDate);
      } else {
        updateData.dueDate = null;
      }
    }
    if (validatedData.assignedToId !== undefined) {
      updateData.assignedToId = validatedData.assignedToId;
    }

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
      include: {
        column: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(card);
  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    res.status(400).json({ error: 'Erro ao atualizar card' });
  }
});

// DELETE /api/card/:id - Deletar card
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar card:', error);
    res.status(500).json({ error: 'Erro ao deletar card' });
  }
});

// POST /api/card/move - Mover card entre colunas
router.post('/move', async (req: Request, res: Response) => {
  try {
    const validatedData = moveCardSchema.parse(req.body);

    // Buscar card atual
    const card = await prisma.card.findUnique({
      where: { id: validatedData.cardId },
      include: { column: true },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado' });
    }

    // Buscar coluna de destino
    const targetColumn = await prisma.column.findUnique({
      where: { id: validatedData.targetColumnId },
    });

    if (!targetColumn) {
      return res.status(404).json({ error: 'Coluna não encontrada' });
    }

    // Se movendo para a mesma coluna, apenas reordenar
    if (card.columnId === validatedData.targetColumnId) {
      const updatedCard = await prisma.card.update({
        where: { id: validatedData.cardId },
        data: {
          order: validatedData.order ?? card.order,
        },
        include: {
          column: true,
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          history: {
            orderBy: { movedAt: 'desc' },
            take: 5,
          },
        },
      });

      return res.json(updatedCard);
    }

    // Se movendo para coluna diferente, contar cards na coluna de destino
    const cardsInTargetColumn = await prisma.card.count({
      where: { columnId: validatedData.targetColumnId },
    });

    // Atualizar card e criar histórico
    const updatedCard = await prisma.$transaction(async (tx) => {
      // Criar registro no histórico
      await tx.cardHistory.create({
        data: {
          cardId: card.id,
          from: card.column.name,
          to: targetColumn.name,
        },
      });

      // Atualizar card
      return tx.card.update({
        where: { id: validatedData.cardId },
        data: {
          columnId: validatedData.targetColumnId,
          order: validatedData.order ?? cardsInTargetColumn,
        },
        include: {
          column: true,
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          history: {
            orderBy: { movedAt: 'desc' },
            take: 5,
          },
        },
      });
    });

    res.json(updatedCard);
  } catch (error) {
    console.error('Erro ao mover card:', error);
    res.status(400).json({ error: 'Erro ao mover card' });
  }
});

// GET /api/card/user/my-cards - Buscar cards do usuário autenticado
router.get('/user/my-cards', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const cards = await prisma.card.findMany({
      where: {
        assignedToId: userId,
      },
      include: {
        column: {
          include: {
            board: {
              include: {
                team: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cards do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar cards do usuário' });
  }
});

export default router;
