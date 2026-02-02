'use client';

import { useEffect } from 'react';
import { useKanbanStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Metrics({ teamId }: { teamId?: string }) {
  const { metrics, fetchMetrics } = useKanbanStore();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    fetchMetrics(token);
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(() => fetchMetrics(token), 30000);
    return () => clearInterval(interval);
  }, [token, fetchMetrics]);

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Cards</p>
              <p className="text-3xl font-bold text-gray-800">{metrics.totalCards}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Cards Concluídos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Concluídos</p>
              <p className="text-3xl font-bold text-green-600">{metrics.completedCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Cards Atrasados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Atrasados</p>
              <p className="text-3xl font-bold text-red-600">{metrics.overdueCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Vencem Hoje */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vencem Hoje</p>
              <p className="text-3xl font-bold text-yellow-600">{metrics.dueTodayCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards por Coluna */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Cards por Coluna
        </h3>
        <div className="space-y-3">
          {metrics.cardsByColumn.map((col) => (
            <div key={col.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{col.name}</span>
                <span className="text-sm font-bold text-gray-800">{col.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${col.name === 'A Fazer'
                    ? 'bg-gray-500'
                    : col.name === 'Em Progresso'
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                    }`}
                  style={{
                    width: `${metrics.totalCards > 0 ? (col.count / metrics.totalCards) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tempo Médio por Coluna */}
      {metrics.avgTimeByColumn.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tempo Médio por Coluna
          </h3>
          <div className="space-y-3">
            {metrics.avgTimeByColumn.map((item) => (
              <div key={item.columnName} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.columnName}</span>
                <span className="text-sm font-bold text-gray-800">
                  {item.avgTimeInHours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Concluídos por Dia */}
      {metrics.completedByDay.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cards Concluídos (Últimos 7 dias)
          </h3>
          <div className="space-y-2">
            {metrics.completedByDay.map((item) => (
              <div key={item.date} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...metrics.completedByDay.map((d) => d.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
