import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

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
router.get('/', async (req: Request, res: Response) => {
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, boardId, color } = req.body;

    if (!name || !boardId) {
      return res.status(400).json({ error: 'Nome e boardId são obrigatórios' });
    }

    // Contar colunas existentes para definir a ordem
    const columnCount = await prisma.column.count({
      where: { boardId },
    });

    const column = await prisma.column.create({
      data: {
        name,
        boardId,
        order: columnCount,
        color: color || null,
      },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json(column);
  } catch (error) {
    console.error('Erro ao criar coluna:', error);
    res.status(400).json({ error: 'Erro ao criar coluna' });
  }
});

// DELETE /api/column/:id - Deletar coluna
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se a coluna tem cards
    const cardCount = await prisma.card.count({
      where: { columnId: id },
    });

    if (cardCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar uma coluna com cards. Mova os cards primeiro.'
      });
    }

    await prisma.column.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar coluna:', error);
    res.status(500).json({ error: 'Erro ao deletar coluna' });
  }
});

// PUT /api/column/:id - Atualizar nome da coluna
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const column = await prisma.column.update({
      where: { id },
      data: { name, color: color || null },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(column);
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error);
    res.status(400).json({ error: 'Erro ao atualizar coluna' });
  }
});


// PATCH /api/column/reorder - Reordenar colunas
router.patch('/reorder/:boardId', async (req: Request, res: Response) => {
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
