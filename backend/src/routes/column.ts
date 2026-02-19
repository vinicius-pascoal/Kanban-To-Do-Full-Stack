import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';
import { checkPermission, getTeamIdFromColumn } from '../lib/permissions';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/column:
 *   get:
 *     summary: Buscar todas as colunas
 *     tags: [Column]
 *     responses:
 *       200:
 *         description: Lista de colunas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Column'
 *       500:
 *         description: Erro ao buscar colunas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/column - Buscar todas as colunas
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const columns = await prisma.column.findMany({
      orderBy: { order: 'asc' },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(columns);
  } catch (error) {
    console.error('Erro ao buscar colunas:', error);
    res.status(500).json({ error: 'Erro ao buscar colunas' });
  }
});

/**
 * @swagger
 * /api/column:
 *   post:
 *     summary: Criar nova coluna
 *     tags: [Column]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - boardId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Em Revisão
 *               boardId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Coluna criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/column - Criar nova coluna
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || '';
    const { name, boardId, color, isCompleted } = req.body;

    if (!name || !boardId) {
      return res.status(400).json({ error: 'Nome e boardId são obrigatórios' });
    }

    // Verificar permissão de criar coluna
    const board = await prisma.board.findUnique({ where: { id: boardId }, select: { teamId: true } });
    if (board?.teamId) {
      if (!(await checkPermission(userId, board.teamId, 'canCreateColumn', res))) return;
    }

    const columnCount = await prisma.column.count({ where: { boardId } });

    const column = await prisma.column.create({
      data: {
        name,
        boardId,
        order: columnCount,
        color: color || null,
        isCompleted: isCompleted || false,
      },
      include: {
        cards: { orderBy: { order: 'asc' } },
      },
    });

    res.status(201).json(column);
  } catch (error) {
    console.error('Erro ao criar coluna:', error);
    res.status(400).json({ error: 'Erro ao criar coluna' });
  }
});

// DELETE /api/column/:id - Deletar coluna
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || '';
    const { id } = req.params;

    // Verificar permissão de remover coluna
    const teamId = await getTeamIdFromColumn(id);
    if (teamId) {
      if (!(await checkPermission(userId, teamId, 'canRemoveColumn', res))) return;
    }

    const cardCount = await prisma.card.count({ where: { columnId: id } });
    if (cardCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar uma coluna com cards. Mova os cards primeiro.',
      });
    }

    await prisma.column.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar coluna:', error);
    res.status(500).json({ error: 'Erro ao deletar coluna' });
  }
});

// PUT /api/column/:id - Atualizar nome da coluna
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || '';
    const { id } = req.params;
    const { name, color, isCompleted } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Verificar permissão de editar coluna
    const teamId = await getTeamIdFromColumn(id);
    if (teamId) {
      if (!(await checkPermission(userId, teamId, 'canEditColumn', res))) return;
    }

    const column = await prisma.column.update({
      where: { id },
      data: {
        name,
        color: color || null,
        ...(isCompleted !== undefined && { isCompleted }),
      },
      include: {
        cards: { orderBy: { order: 'asc' } },
      },
    });

    res.json(column);
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error);
    res.status(400).json({ error: 'Erro ao atualizar coluna' });
  }
});


// PATCH /api/column/reorder - Reordenar colunas
router.patch('/reorder/:boardId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const { columnIds } = req.body;

    if (!columnIds || !Array.isArray(columnIds)) {
      return res.status(400).json({ error: 'columnIds array é obrigatório' });
    }

    // Atualizar a ordem de cada coluna
    await Promise.all(
      columnIds.map((columnId, index) =>
        prisma.column.update({
          where: { id: columnId },
          data: { order: index },
        })
      )
    );

    // Buscar e retornar as colunas atualizadas
    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(columns);
  } catch (error) {
    console.error('Erro ao reordenar colunas:', error);
    res.status(500).json({ error: 'Erro ao reordenar colunas' });
  }
});

export default router;
