'use client';

import { useState } from 'react';
import Board from '@/components/Board';
import Metrics from '@/components/Metrics';
import { LayoutDashboard, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'board' | 'metrics'>('board');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">📌 Kanban To-Do Full Stack</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sistema completo de gerenciamento de tarefas
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'board'
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Board Kanban
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'metrics'
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              Métricas
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'board' ? <Board /> : <Metrics />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          Desenvolvido com Next.js, TypeScript, Tailwind CSS e SQLite
        </div>
      </footer>
    </div>
  );
}
