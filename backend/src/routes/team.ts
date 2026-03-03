import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';
import { createTeamSchema, addTeamMemberSchema } from '../lib/auth-validations';
import {
  ALL_PERMISSIONS,
  DEFAULT_MEMBER_PERMISSIONS,
  checkPermission,
  getTeamMember,
} from '../lib/permissions';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Listar times do usuário
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: Lista de times retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
    const { name, template = 'default' } = validatedData;

    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId: req.user?.userId || '',
            ...ALL_PERMISSIONS,
          },
        },
        boards: {
          create: {
            name: 'Meu Kanban',
            ...(template === 'default' ? {
              columns: {
                create: [
                  { name: 'A Fazer', order: 0 },
                  { name: 'Em Progresso', order: 1 },
                  { name: 'Concluído', order: 2, isCompleted: true },
                ],
              },
            } : {}),
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

    // Verificar se usuário logado tem permissão para adicionar membro
    if (!(await checkPermission(req.user?.userId || '', id, 'canAddMember', res))) return;

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

    // Adicionar novo membro com permissões padrão (nenhuma)
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: id,
        ...DEFAULT_MEMBER_PERMISSIONS,
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

    // Verificar permissão para remover membro
    if (!(await checkPermission(req.user?.userId || '', id, 'canRemoveMember', res))) return;

    // Impedir que o dono seja removido
    const targetMember = await getTeamMember(userId, id);
    if (targetMember?.isOwner) {
      return res.status(400).json({ error: 'O dono do time não pode ser removido.' });
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

// PATCH /api/team/:id/name - Renomear time
router.patch('/:id/name', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (!(await checkPermission(req.user?.userId || '', id, 'canRenameTeam', res))) return;

    const team = await prisma.team.update({
      where: { id },
      data: { name: name.trim() },
    });

    res.json(team);
  } catch (error) {
    console.error('Erro ao renomear time:', error);
    res.status(500).json({ error: 'Erro ao renomear time' });
  }
});

// PATCH /api/team/:id/members/:userId/permissions - Atualizar permissões de membro
router.patch('/:id/members/:userId/permissions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    const requesterId = req.user?.userId || '';

    // Somente o dono pode gerenciar permissões
    const requesterMember = await getTeamMember(requesterId, id);
    if (!requesterMember?.isOwner) {
      return res.status(403).json({ error: 'Apenas o dono do time pode gerenciar permissões.' });
    }

    // Impedir alterar permissões do próprio dono
    const targetMember = await getTeamMember(userId, id);
    if (!targetMember) {
      return res.status(404).json({ error: 'Membro não encontrado.' });
    }
    if (targetMember.isOwner) {
      return res.status(400).json({ error: 'Não é possível alterar as permissões do dono.' });
    }

    const allowedFields: (keyof typeof DEFAULT_MEMBER_PERMISSIONS)[] = [
      'canCreateCard',
      'canEditCard',
      'canRemoveCard',
      'canCreateColumn',
      'canEditColumn',
      'canRemoveColumn',
      'canAddMember',
      'canRemoveMember',
      'canRenameTeam',
      'canViewMetrics',
      'canManageTags',
    ];

    const updateData: Record<string, boolean> = {};
    for (const field of allowedFields) {
      if (typeof req.body[field] === 'boolean') {
        updateData[field] = req.body[field];
      }
    }

    const updated = await prisma.teamMember.update({
      where: { userId_teamId: { userId, teamId: id } },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro ao atualizar permissões' });
  }
});

// DELETE /api/team/:id - Deletar time
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Apenas donos podem deletar o time
    const member = await getTeamMember(req.user?.userId || '', id);
    if (!member?.isOwner) {
      return res.status(403).json({ error: 'Apenas o dono pode deletar o time.' });
    }

    // Deletar o time (cascata vai deletar todos os relacionados)
    await prisma.team.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar time:', error);
    res.status(500).json({ error: 'Erro ao deletar time' });
  }
});

export default router;
