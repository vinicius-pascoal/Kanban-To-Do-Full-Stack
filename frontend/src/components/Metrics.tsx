'use client';

import { useEffect } from 'react';
import { useKanbanStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
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
  const { metrics, fetchMetrics } = useKanbanStore();
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !teamId) return;

    fetchMetrics(teamId, token);
    const interval = setInterval(() => fetchMetrics(teamId, token), 30000);
    return () => clearInterval(interval);
  }, [token, teamId, fetchMetrics]);

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Carregando métricas...</p>
      </div>
    );
  }

  const completedByDayData = metrics.completedByDay || [];
  const memberData = (metrics.memberProductivity || []).map((member) => ({
    ...member,
    totalCards: member.cardsCompleted + member.cardsInProgress,
  }));

  return (
    <div className="space-y-6">
      {/* Cards de Resumo KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Cards */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-2">Total de Cards</p>
              <p className="text-4xl font-bold text-blue-900">{metrics.totalCards}</p>
              <p className="text-xs text-blue-600 mt-2">Todos os tasks do projeto</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Cards Concluídos */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-2">Concluídos</p>
              <p className="text-4xl font-bold text-green-900">{metrics.completedCount}</p>
              <p className="text-xs text-green-600 mt-2">
                {metrics.totalCards > 0
                  ? `${Math.round((metrics.completedCount / metrics.totalCards) * 100)}% do total`
                  : '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Cards Atrasados */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700 mb-2">Atrasados</p>
              <p className="text-4xl font-bold text-red-900">{metrics.overdueCount}</p>
              <p className="text-xs text-red-600 mt-2">Exigem atenção imediata</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Vencem Hoje */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-700 mb-2">Vencem Hoje</p>
              <p className="text-4xl font-bold text-yellow-900">{metrics.dueTodayCount}</p>
              <p className="text-xs text-yellow-600 mt-2">Urgentes para hoje</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos em Grid - Estilo Power BI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Cards por Coluna */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
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
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Cards Concluídos (Últimos 7 dias)
          </h3>
          {completedByDayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completedByDayData}>
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
            <p className="text-gray-500 text-center py-12">
              Nenhum card concluído nos últimos 7 dias
            </p>
          )}
        </div>

        {/* Gráfico de Linha - Tempo Médio por Coluna */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
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
            <p className="text-gray-500 text-center py-12">
              Sem histórico de movimentação de cards
            </p>
          )}
        </div>

        {/* Gráfico de Barras - Status de Cards */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Produtividade dos Membros
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Cards Completados por Membro */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
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
                <p className="text-gray-500 text-center py-12">
                  Nenhum membro com cards atribuídos
                </p>
              )}
            </div>

            {/* Gráfico de Produtividade Total */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
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
                <p className="text-gray-500 text-center py-12">
                  Nenhum membro com cards atribuídos
                </p>
              )}
            </div>
          </div>

          {/* Tabela de Produtividade Detalhada */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Detalhes de Produtividade</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Membro
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Concluídos
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Em Progresso
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Total de Cards
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Taxa de Conclusão
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
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
                        className={`border-b border-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800">{member.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-semibold">
                            {member.cardsCompleted}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                            {member.cardsInProgress}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-700">
                            {member.totalCards}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${taxaConclusao}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-10">
                              {taxaConclusao}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold text-sm">
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
