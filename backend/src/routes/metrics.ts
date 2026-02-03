import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { isOverdue, isDueToday } from '../lib/date-utils';
import { AuthenticatedRequest, authMiddleware } from '../lib/auth-middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/metrics - Buscar métricas do board
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.query;

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'teamId é obrigatório' });
    }

    // Encontrar o board do time
    const board = await prisma.board.findFirst({
      where: { teamId },
      include: { columns: true },
    });

    if (!board) {
      return res.json({
        totalCards: 0,
        cardsByColumn: [],
        overdueCount: 0,
        dueTodayCount: 0,
        completedCount: 0,
        avgTimeByColumn: [],
        completedByDay: [],
        memberProductivity: [],
      });
    }

    // Total de cards
    const totalCards = await prisma.card.count({
      where: {
        column: {
          boardId: board.id,
        },
      },
    });

    // Cards por coluna
    const cardsByColumn = await prisma.column.findMany({
      where: { boardId: board.id },
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Cards atrasados (não concluídos com data vencida)
    const allCards = await prisma.card.findMany({
      where: {
        column: {
          boardId: board.id,
        },
      },
      include: { column: true },
    });

    const overdueCards = allCards.filter(
      (card) => card.column.name !== 'Concluído' && isOverdue(card.dueDate)
    );

    const dueTodayCards = allCards.filter(
      (card) => card.column.name !== 'Concluído' && isDueToday(card.dueDate)
    );

    // Cards concluídos
    const completedColumn = await prisma.column.findFirst({
      where: { name: 'Concluído', boardId: board.id },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    // Calcular tempo médio por coluna (baseado no histórico)
    const history = await prisma.cardHistory.findMany({
      where: {
        card: {
          column: {
            boardId: board.id,
          },
        },
      },
      include: { card: true },
    });

    const timeByColumn: Record<string, { totalTime: number; count: number }> = {};

    // Agrupar histórico por card
    const historyByCard: Record<string, any[]> = {};
    history.forEach((h) => {
      if (!historyByCard[h.cardId]) {
        historyByCard[h.cardId] = [];
      }
      historyByCard[h.cardId].push(h);
    });

    // Calcular tempo em cada coluna
    Object.values(historyByCard).forEach((cardHistory) => {
      cardHistory.sort((a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime());

      for (let i = 0; i < cardHistory.length - 1; i++) {
        const current = cardHistory[i];
        const next = cardHistory[i + 1];
        const timeInColumn = new Date(next.movedAt).getTime() - new Date(current.movedAt).getTime();
        const columnName = current.to;

        if (!timeByColumn[columnName]) {
          timeByColumn[columnName] = { totalTime: 0, count: 0 };
        }

        timeByColumn[columnName].totalTime += timeInColumn;
        timeByColumn[columnName].count += 1;
      }
    });

    const avgTimeByColumn = Object.entries(timeByColumn).map(([columnName, data]) => ({
      columnName,
      avgTimeInHours: data.count > 0 ? Math.round((data.totalTime / data.count) / (1000 * 60 * 60)) : 0,
    }));

    // Cards concluídos por dia (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCompletedCards = await prisma.card.findMany({
      where: {
        columnId: completedColumn?.id || '',
        updatedAt: { gte: sevenDaysAgo },
      },
      orderBy: { updatedAt: 'asc' },
    });

    // Agrupar por dia
    const completedByDay: Record<string, number> = {};
    recentCompletedCards.forEach((card) => {
      const date = card.updatedAt.toISOString().split('T')[0];
      completedByDay[date] = (completedByDay[date] || 0) + 1;
    });

    const completedByDayArray = Object.entries(completedByDay).map(([date, count]) => ({
      date,
      count,
    }));

    // Produtividade dos membros
    const allCardsWithAssigned = await prisma.card.findMany({
      where: {
        column: {
          boardId: board.id,
        },
      },
      include: { assignedTo: true, column: true },
    });

    const memberProductivity: Record<string, {
      name: string;
      cardsCreated: number;
      cardsCompleted: number;
      cardsInProgress: number;
      averageTimeToComplete: number;
    }> = {};

    // Contar cards por membro
    allCardsWithAssigned.forEach((card) => {
      if (card.assignedToId) {
        const memberId = card.assignedToId;
        if (!memberProductivity[memberId]) {
          memberProductivity[memberId] = {
            name: card.assignedTo?.name || 'Desconhecido',
            cardsCreated: 0,
            cardsCompleted: 0,
            cardsInProgress: 0,
            averageTimeToComplete: 0,
          };
        }

        if (card.column.name === 'Concluído') {
          memberProductivity[memberId].cardsCompleted += 1;
        } else if (card.column.name === 'Em Progresso') {
          memberProductivity[memberId].cardsInProgress += 1;
        }

        memberProductivity[memberId].cardsCreated += 1;
      }
    });

    // Calcular tempo médio para completar por membro
    const cardsByMember: Record<string, any[]> = {};
    allCardsWithAssigned.forEach((card) => {
      if (card.assignedToId) {
        if (!cardsByMember[card.assignedToId]) {
          cardsByMember[card.assignedToId] = [];
        }
        cardsByMember[card.assignedToId].push(card);
      }
    });

    Object.entries(cardsByMember).forEach(([memberId, cards]) => {
      const completedCards = cards.filter((c) => c.column.name === 'Concluído');
      if (completedCards.length > 0 && memberProductivity[memberId]) {
        const historyForMember = history.filter((h) =>
          completedCards.some((c) => c.id === h.cardId)
        );

        const timesPerCard = completedCards.map((card) => {
          const cardHistory = historyForMember.filter((h) => h.cardId === card.id);
          if (cardHistory.length < 2) return 0;

          const sorted = cardHistory.sort(
            (a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime()
          );

          const startTime = new Date(sorted[0].movedAt).getTime();
          const endTime = new Date(sorted[sorted.length - 1].movedAt).getTime();
          return (endTime - startTime) / (1000 * 60 * 60); // em horas
        });

        const avgTime = timesPerCard.length > 0
          ? Math.round(timesPerCard.reduce((a, b) => a + b, 0) / timesPerCard.length)
          : 0;

        memberProductivity[memberId].averageTimeToComplete = avgTime;
      }
    });

    const memberProductivityArray = Object.values(memberProductivity).sort(
      (a, b) => b.cardsCompleted - a.cardsCompleted
    );

    res.json({
      totalCards,
      cardsByColumn: cardsByColumn.map((col) => ({
        name: col.name,
        count: col._count.cards,
      })),
      overdueCount: overdueCards.length,
      dueTodayCount: dueTodayCards.length,
      completedCount: completedColumn?._count.cards || 0,
      avgTimeByColumn,
      completedByDay: completedByDayArray,
      memberProductivity: memberProductivityArray,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

export default router;
