import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createBoardSchema } from '../lib/validations';

const router = Router();

/**
 * @swagger
 * /api/board:
 *   get:
 *     summary: Buscar board com colunas e cards
 *     tags: [Board]
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do time
 *     responses:
 *       200:
 *         description: Board retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: teamId não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/board - Buscar board com colunas e cards
router.get('/', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.query;

    console.log('🔍 GET /api/board - teamId:', teamId);

    if (!teamId || typeof teamId !== 'string') {
      console.log('❌ teamId inválido ou ausente');
      return res.status(400).json({ error: 'teamId é obrigatório' });
    }

    let board = await prisma.board.findFirst({
      where: {
        teamId,
      },
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
                assignedTo: {
                  select: { id: true, name: true, email: true },
                },
                tags: true,
              },
            },
          },
        },
      },
    });

    if (board) {
      console.log('✅ Board encontrado:', board.id, 'para team:', teamId);
    } else {
      console.log('⚠️ Board não encontrado, criando novo para team:', teamId);
    }

    // Se não existir board, cria um com colunas padrão
    if (!board) {
      board = await prisma.board.create({
        data: {
          name: 'Meu Kanban',
          teamId,
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
                include: {
                  assignedTo: {
                    select: { id: true, name: true, email: true },
                  },
                  tags: true,
                },
              },
            },
          },
        },
      });
      console.log('✅ Novo board criado:', board.id);
    }

    res.json(board);
  } catch (error) {
    console.error('❌ Erro ao buscar board:', error);
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
