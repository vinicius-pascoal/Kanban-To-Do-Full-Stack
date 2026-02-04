'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Board from '@/components/Board';
import Metrics from '@/components/Metrics';
import { LayoutDashboard, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

function DashboardContent() {
  const params = useParams();
  const router = useRouter();
  const { user, token, currentTeam, fetchTeam, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const teamId = params.teamId as string;
  const [activeTab, setActiveTab] = useState<'board' | 'metrics'>('board');

  // Verificar autenticação apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user || !token) {
      router.push('/login');
      return;
    }
  }, [mounted, user, token, router]);

  useEffect(() => {
    if (teamId && token) {
      fetchTeam(teamId);
    }
  }, [teamId, token, fetchTeam]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  // Mostrar loading enquanto verifica autenticação
  if (!mounted || !user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Carregando...</h1>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'board'
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Board Kanban
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'metrics'
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              Métricas
            </button>
            <button
              onClick={() => router.push(`/teams/${teamId}/settings`)}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent border-b-2"
            >
              <Settings className="w-5 h-5" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1">
        {activeTab === 'board' ? <Board teamId={teamId} /> : <Metrics teamId={teamId} />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Desenvolvido com Next.js, TypeScript, Tailwind CSS e SQLite
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
