import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/comment/card/:cardId - Listar comentários de um card
router.get('/card/:cardId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cardId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { cardId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// POST /api/comment - Criar comentário
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const { cardId, content } = req.body;

    if (!cardId || !content || !content.trim()) {
      return res.status(400).json({ error: 'cardId e content são obrigatórios' });
    }

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return res.status(404).json({ error: 'Card não encontrado' });

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        cardId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
});

// DELETE /api/comment/:id - Deletar comentário (apenas o autor)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar este comentário' });
    }

    await prisma.comment.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ error: 'Erro ao deletar comentário' });
  }
});

export default router;
