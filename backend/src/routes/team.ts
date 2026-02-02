import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';
import { createTeamSchema, addTeamMemberSchema } from '../lib/auth-validations';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/team - Listar times do usuário
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.user?.userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        boards: {
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
        },
      },
    });

    res.json(teams);
  } catch (error) {
    console.error('Erro ao listar times:', error);
    res.status(500).json({ error: 'Erro ao listar times' });
  }
});

// GET /api/team/:id - Buscar time específico
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se usuário é membro do time
    const isMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user?.userId || '',
          teamId: id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        boards: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(team);
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    res.status(500).json({ error: 'Erro ao buscar time' });
  }
});

// POST /api/team - Criar novo time
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createTeamSchema.parse(req.body);

    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
        members: {
          create: {
            userId: req.user?.userId || '',
          },
        },
        boards: {
          create: {
            name: 'Meu Kanban',
            columns: {
              create: [
                { name: 'A Fazer', order: 0 },
                { name: 'Em Progresso', order: 1 },
                { name: 'Concluído', order: 2 },
              ],
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        boards: true,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Erro ao criar time:', error);
    res.status(400).json({ error: 'Erro ao criar time' });
  }
});

// POST /api/team/:id/members - Adicionar membro ao time
router.post('/:id/members', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addTeamMemberSchema.parse(req.body);

    // Verificar se usuário logado é membro do time
    const isMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user?.userId || '',
          teamId: id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se já é membro
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId: id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Usuário já é membro do time' });
    }

    // Adicionar novo membro
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: id,
      },
    });

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(400).json({ error: 'Erro ao adicionar membro' });
  }
});

// DELETE /api/team/:id/members/:userId - Remover membro do time
router.delete('/:id/members/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, userId } = req.params;

    // Verificar se usuário logado é membro do time
    const isMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user?.userId || '',
          teamId: id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId,
          teamId: id,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

export default router;
