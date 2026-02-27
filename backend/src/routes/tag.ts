import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/tag/board/:boardId - Listar tags de um board
router.get('/board/:boardId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { boardId } = req.params;

    const tags = await prisma.tag.findMany({
      where: { boardId },
      orderBy: { name: 'asc' },
    });

    res.json(tags);
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    res.status(500).json({ error: 'Erro ao buscar tags' });
  }
});

// POST /api/tag - Criar tag
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color, boardId } = req.body;

    if (!name || !name.trim() || !boardId) {
      return res.status(400).json({ error: 'name e boardId são obrigatórios' });
    }

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return res.status(404).json({ error: 'Board não encontrado' });

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#6366f1',
        boardId,
      },
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    res.status(500).json({ error: 'Erro ao criar tag' });
  }
});

// DELETE /api/tag/:id - Deletar tag
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) return res.status(404).json({ error: 'Tag não encontrada' });

    await prisma.tag.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar tag:', error);
    res.status(500).json({ error: 'Erro ao deletar tag' });
  }
});

// PUT /api/tag/card/:cardId - Substituir todas as tags de um card
router.put('/card/:cardId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { tagIds } = req.body as { tagIds: string[] };

    if (!Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'tagIds deve ser um array' });
    }

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return res.status(404).json({ error: 'Card não encontrado' });

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        tags: {
          set: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });

    res.json(updatedCard.tags);
  } catch (error) {
    console.error('Erro ao atualizar tags do card:', error);
    res.status(500).json({ error: 'Erro ao atualizar tags do card' });
  }
});

export default router;
