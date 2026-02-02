import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { isOverdue, isDueToday } from '../lib/date-utils';

const router = Router();

// GET /api/metrics - Buscar métricas do board
router.get('/', async (req: Request, res: Response) => {
  try {
    // Total de cards
    const totalCards = await prisma.card.count();

    // Cards por coluna
    const cardsByColumn = await prisma.column.findMany({
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Cards atrasados (não concluídos com data vencida)
    const allCards = await prisma.card.findMany({
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
      where: { name: 'Concluído' },
      include: {
        cards: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    // Calcular tempo médio por coluna (baseado no histórico)
    const history = await prisma.cardHistory.findMany({
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
        column: { name: 'Concluído' },
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
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

export default router;
