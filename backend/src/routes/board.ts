import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createBoardSchema } from '../lib/validations';

const router = Router();

// GET /api/board - Buscar board com colunas e cards
router.get('/', async (req: Request, res: Response) => {
  try {
    let board = await prisma.board.findFirst({
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' },
              include: {
                history: {
                  orderBy: { movedAt: 'desc' },
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    // Se não existir board, cria um com colunas padrão
    if (!board) {
      board = await prisma.board.create({
        data: {
          name: 'Meu Kanban',
          columns: {
            create: [
              { name: 'A Fazer', order: 0 },
              { name: 'Em Progresso', order: 1 },
              { name: 'Concluído', order: 2 },
            ],
          },
        },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              cards: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
    }

    res.json(board);
  } catch (error) {
    console.error('Erro ao buscar board:', error);
    res.status(500).json({ error: 'Erro ao buscar board' });
  }
});

// POST /api/board - Criar novo board
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createBoardSchema.parse(req.body);

    const board = await prisma.board.create({
      data: {
        name: validatedData.name,
        columns: {
          create: [
            { name: 'A Fazer', order: 0 },
            { name: 'Em Progresso', order: 1 },
            { name: 'Concluído', order: 2 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Erro ao criar board:', error);
    res.status(400).json({ error: 'Erro ao criar board' });
  }
});

export default router;
