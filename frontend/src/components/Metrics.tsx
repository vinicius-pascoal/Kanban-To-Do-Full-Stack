'use client';

import { useEffect, useState } from 'react';
import { useKanbanStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Metrics({ teamId }: { teamId?: string }) {
  const { metrics, fetchMetrics, clearBoard } = useKanbanStore();
  const { token, currentTeam } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    console.log('🔄 Metrics useEffect triggered - teamId:', teamId);
    if (!token || !teamId) return;

    // Limpar métricas anteriores
    clearBoard();
    fetchMetrics(teamId, token);
    const interval = setInterval(() => fetchMetrics(teamId, token), 30000);
    return () => {
      console.log('🧹 Metrics cleanup');
      clearInterval(interval);
    };
  }, [token, teamId]);

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">Carregando métricas...</p>
      </div>
    );
  }

  const completedByDayData = metrics.completedByDay || [];
  const completedCardsData = metrics.completedCards || [];
  const memberData = (metrics.memberProductivity || []).map((member) => ({
    ...member,
    totalCards: member.cardsCompleted + member.cardsInProgress,
  }));

  const teamName = currentTeam?.name ?? 'Time';

  const normalizeFileName = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase();

  const isWithinRange = (dateValue: string) => {
    if (!startDate && !endDate) return true;
    const current = new Date(dateValue);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) {
      start.setHours(0, 0, 0, 0);
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    if (start && current < start) return false;
    if (end && current > end) return false;
    return true;
  };

  const filteredCompletedByDayData = completedByDayData.filter((item) =>
    isWithinRange(item.date)
  );

  const filteredCompletedCards = completedCardsData.filter((card) =>
    isWithinRange(card.date)
  );

  const escapeCsv = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const buildCsv = () => {
    const lines: string[] = [];
    const periodLabel = !startDate && !endDate
      ? 'Sem filtro'
      : `${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}`;

    lines.push('Time');
    lines.push([teamName].map(escapeCsv).join(','));
    lines.push('Período');
    lines.push([periodLabel].map(escapeCsv).join(','));
    lines.push('');

    lines.push('Resumo');
    lines.push(
      [
        'Total de Cards',
        'Concluídos',
        'Atrasados',
        'Vencem Hoje',
      ]
        .map(escapeCsv)
        .join(',')
    );
    lines.push(
      [
        metrics.totalCards,
        metrics.completedCount,
        metrics.overdueCount,
        metrics.dueTodayCount,
      ]
        .map(escapeCsv)
        .join(',')
    );
    lines.push('');

    lines.push('Cards por Coluna');
    lines.push(['Coluna', 'Quantidade'].map(escapeCsv).join(','));
    metrics.cardsByColumn.forEach((item) => {
      lines.push([item.name, item.count].map(escapeCsv).join(','));
    });
    lines.push('');

    lines.push('Cards Concluídos por Dia');
    lines.push(['Data', 'Quantidade'].map(escapeCsv).join(','));
    filteredCompletedByDayData.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString('pt-BR');
      lines.push([date, item.count].map(escapeCsv).join(','));
    });
    lines.push('');

    lines.push('Cards Concluídos (nomes)');
    lines.push(['Data', 'Card'].map(escapeCsv).join(','));
    (filteredCompletedCards.length > 0 ? filteredCompletedCards : [{ date: '-', title: '-' }])
      .forEach((item) => {
        const date = item.date === '-' ? '-' : new Date(item.date).toLocaleDateString('pt-BR');
        lines.push([date, item.title].map(escapeCsv).join(','));
      });
    lines.push('');

    lines.push('Tempo Médio por Coluna (horas)');
    lines.push(['Coluna', 'Horas'].map(escapeCsv).join(','));
    metrics.avgTimeByColumn.forEach((item) => {
      lines.push([item.columnName, item.avgTimeInHours].map(escapeCsv).join(','));
    });
    lines.push('');

    lines.push('Produtividade por Membro');
    lines.push(
      [
        'Membro',
        'Cards Criados',
        'Cards Concluídos',
        'Cards em Progresso',
        'Total de Cards',
        'Taxa de Conclusão (%)',
        'Tempo Médio (h)',
      ]
        .map(escapeCsv)
        .join(',')
    );
    memberData.forEach((member) => {
      const taxaConclusao = member.totalCards > 0
        ? Math.round((member.cardsCompleted / member.totalCards) * 100)
        : 0;
      lines.push(
        [
          member.name,
          member.cardsCreated,
          member.cardsCompleted,
          member.cardsInProgress,
          member.totalCards,
          taxaConclusao,
          member.averageTimeToComplete,
        ]
          .map(escapeCsv)
          .join(',')
      );
    });

    return lines.join('\n');
  };

  const downloadFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csv = buildCsv();
    const suffix = normalizeFileName(teamName || 'time');
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `metricas-${suffix}-${date}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default as any;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    const periodLabel = !startDate && !endDate
      ? 'Sem filtro'
      : `${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}`;
    let y = 42;

    doc.setFontSize(16);
    doc.text('Relatório de Métricas - Kanban', marginX, y);
    y += 22;

    doc.setFontSize(10);
    doc.text(`Time: ${teamName}`, marginX, y);
    y += 14;
    doc.text(`Período: ${periodLabel}`, marginX, y);
    y += 14;
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, marginX, y);
    y += 18;

    const addTable = (title: string, head: string[][], body: (string | number)[][]) => {
      doc.setFontSize(12);
      doc.text(title, marginX, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head,
        body,
        theme: 'grid',
        margin: { left: marginX, right: marginX },
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
      y = (doc as any).lastAutoTable.finalY + 18;
    };

    addTable('Resumo', [['Indicador', 'Valor']], [
      ['Total de Cards', metrics.totalCards],
      ['Concluídos', metrics.completedCount],
      ['Atrasados', metrics.overdueCount],
      ['Vencem Hoje', metrics.dueTodayCount],
    ]);

    addTable(
      'Cards por Coluna',
      [['Coluna', 'Quantidade']],
      metrics.cardsByColumn.map((item) => [item.name, item.count])
    );

    addTable(
      'Cards Concluídos por Dia',
      [['Data', 'Quantidade']],
      (filteredCompletedByDayData.length > 0
        ? filteredCompletedByDayData
        : [{ date: '-', count: 0 }]
      ).map((item) => [
        item.date === '-' ? '-' : new Date(item.date).toLocaleDateString('pt-BR'),
        item.count,
      ])
    );

    addTable(
      'Cards Concluídos (nomes)',
      [['Data', 'Card']],
      (filteredCompletedCards.length > 0
        ? filteredCompletedCards
        : [{ date: '-', title: '-' }]
      ).map((item) => [
        item.date === '-' ? '-' : new Date(item.date).toLocaleDateString('pt-BR'),
        item.title,
      ])
    );

    addTable(
      'Tempo Médio por Coluna (h)',
      [['Coluna', 'Horas']],
      metrics.avgTimeByColumn.map((item) => [item.columnName, item.avgTimeInHours])
    );

    addTable(
      'Produtividade por Membro',
      [[
        'Membro',
        'Criados',
        'Concluídos',
        'Em Progresso',
        'Total',
        'Conclusão (%)',
        'Tempo Médio (h)',
      ]],
      memberData.map((member) => {
        const taxaConclusao = member.totalCards > 0
          ? Math.round((member.cardsCompleted / member.totalCards) * 100)
          : 0;
        return [
          member.name,
          member.cardsCreated,
          member.cardsCompleted,
          member.cardsInProgress,
          member.totalCards,
          taxaConclusao,
          member.averageTimeToComplete,
        ];
      })
    );

    const suffix = normalizeFileName(teamName || 'time');
    const date = new Date().toISOString().slice(0, 10);
    doc.save(`metricas-${suffix}-${date}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Métricas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exporte os dados para análise externa.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">De</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Até</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800"
            >
              Limpar filtro
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>
      {/* Cards de Resumo KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Cards */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg shadow-md p-6 border-l-4 border-blue-600 dark:border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Total de Cards</p>
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalCards}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Todos os tasks do projeto</p>
            </div>
            <div className="p-3 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Cards Concluídos */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg shadow-md p-6 border-l-4 border-green-600 dark:border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Concluídos</p>
              <p className="text-4xl font-bold text-green-900 dark:text-green-100">{metrics.completedCount}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {metrics.totalCards > 0
                  ? `${Math.round((metrics.completedCount / metrics.totalCards) * 100)}% do total`
                  : '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-200 dark:bg-green-800/50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Cards Atrasados */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg shadow-md p-6 border-l-4 border-red-600 dark:border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Atrasados</p>
              <p className="text-4xl font-bold text-red-900 dark:text-red-100">{metrics.overdueCount}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">Exigem atenção imediata</p>
            </div>
            <div className="p-3 bg-red-200 dark:bg-red-800/50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Vencem Hoje */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg shadow-md p-6 border-l-4 border-yellow-600 dark:border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Vencem Hoje</p>
              <p className="text-4xl font-bold text-yellow-900 dark:text-yellow-100">{metrics.dueTodayCount}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Urgentes para hoje</p>
            </div>
            <div className="p-3 bg-yellow-200 dark:bg-yellow-800/50 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos em Grid - Estilo Power BI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Cards por Coluna */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Distribuição de Cards por Coluna
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.cardsByColumn}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.cardsByColumn.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} cards`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Cards Concluídos por Dia */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Cards Concluídos (Últimos 7 dias)
          </h3>
          {filteredCompletedByDayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredCompletedByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('pt-BR', {
                      month: '2-digit',
                      day: '2-digit',
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value} cards`}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString('pt-BR')
                  }
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              Nenhum card concluído nos últimos 7 dias
            </p>
          )}
        </div>

        {/* Gráfico de Linha - Tempo Médio por Coluna */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Tempo Médio por Coluna
          </h3>
          {metrics.avgTimeByColumn.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.avgTimeByColumn}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="columnName" tick={{ fontSize: 12 }} />
                <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value) => `${value}h`}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgTimeInHours"
                  stroke="#f59e0b"
                  name="Tempo Médio"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              Sem histórico de movimentação de cards
            </p>
          )}
        </div>

        {/* Gráfico de Barras - Status de Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Status dos Cards
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  status: 'Cards',
                  Concluídos: metrics.completedCount,
                  Pendentes: metrics.totalCards - metrics.completedCount,
                  Atrasados: metrics.overdueCount,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Concluídos" fill="#10b981" />
              <Bar dataKey="Pendentes" fill="#3b82f6" />
              <Bar dataKey="Atrasados" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção de Produtividade dos Membros */}
      {memberData.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Produtividade dos Membros
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Cards Completados por Membro */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Cards Concluídos por Membro
              </h3>
              {memberData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${value} cards`} />
                    <Bar dataKey="cardsCompleted" fill="#10b981" name="Concluídos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  Nenhum membro com cards atribuídos
                </p>
              )}
            </div>

            {/* Gráfico de Produtividade Total */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Produtividade por Membro
              </h3>
              {memberData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={memberData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cardsCompleted" fill="#10b981" name="Concluídos" />
                    <Bar dataKey="cardsInProgress" fill="#3b82f6" name="Em Progresso" />
                    <Line type="monotone" dataKey="averageTimeToComplete" stroke="#f59e0b" name="Tempo Médio (h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  Nenhum membro com cards atribuídos
                </p>
              )}
            </div>
          </div>

          {/* Tabela de Produtividade Detalhada */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detalhes de Produtividade</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Membro
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Concluídos
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Em Progresso
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Total de Cards
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Taxa de Conclusão
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Tempo Médio (h)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberData.map((member, index) => {
                    const taxaConclusao = member.totalCards > 0
                      ? Math.round((member.cardsCompleted / member.totalCards) * 100)
                      : 0;

                    return (
                      <tr
                        key={member.name}
                        className={`border-b border-gray-100 dark:border-slate-700 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700/50'
                          } hover:bg-blue-50 dark:hover:bg-slate-700`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800 dark:text-gray-100">{member.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 rounded-full font-semibold">
                            {member.cardsCompleted}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 rounded-full font-semibold">
                            {member.cardsInProgress}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {member.totalCards}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${taxaConclusao}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-10">
                              {taxaConclusao}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200 rounded-full font-semibold text-sm">
                            {member.averageTimeToComplete}h
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Taxa de Conclusão</h4>
          <p className="text-2xl font-bold text-blue-700">
            {metrics.totalCards > 0
              ? `${Math.round((metrics.completedCount / metrics.totalCards) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-blue-600 mt-1">Do total de tasks</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2">⚠️ Taxa de Atraso</h4>
          <p className="text-2xl font-bold text-red-700">
            {metrics.totalCards > 0
              ? `${Math.round((metrics.overdueCount / metrics.totalCards) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-red-600 mt-1">Do total de tasks</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">⏱️ Tempo Médio</h4>
          <p className="text-2xl font-bold text-green-700">
            {metrics.avgTimeByColumn.length > 0
              ? `${Math.round(
                metrics.avgTimeByColumn.reduce((a, b) => a + b.avgTimeInHours, 0) /
                metrics.avgTimeByColumn.length
              )}h`
              : '-'}
          </p>
          <p className="text-xs text-green-600 mt-1">Por coluna</p>
        </div>
      </div>
    </div>
  );
}
