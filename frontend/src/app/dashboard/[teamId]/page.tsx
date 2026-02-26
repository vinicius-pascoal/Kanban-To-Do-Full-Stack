'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Board from '@/components/Board';
import Metrics from '@/components/Metrics';
import { LayoutDashboard, BarChart3, Settings, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { TeamMember } from '@/lib/types';

function DashboardContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const teamId = params.teamId as string;
  const [activeTab, setActiveTab] = useState<'board' | 'metrics'>('board');
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar autenticação apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Middleware handles authentication - no manual redirect needed

  useEffect(() => {
    if (teamId && session?.backendToken) {
      fetchTeam(teamId);
    }
  }, [teamId, session]);

  const fetchTeam = async (id: string) => {
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      const team = await api.getTeam(id, session.backendToken);
      setCurrentTeam(team);
      localStorage.setItem('currentTeam', JSON.stringify(team));
    } catch (error) {
      console.error('Erro ao carregar time:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMember: TeamMember | undefined = currentTeam?.members?.find(
    (m: TeamMember) => m.userId === session?.user?.id,
  );

  const handleLogout = () => {
    localStorage.removeItem('currentTeam');
    router.push('/login');
  };

  // Mostrar loading enquanto verifica autenticação
  if (!mounted || status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Carregando...</h1>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b dark:border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-all ${activeTab === 'board'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Board Planify
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-all ${activeTab === 'metrics'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              Métricas
            </button>
            <button
              onClick={() => router.push(`/teams/${teamId}/settings`)}
              className="flex items-center gap-2 px-5 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent border-b-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <Settings className="w-5 h-5" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-full mx-auto px-4 py-8 flex-1 w-full min-h-0">
        {activeTab === 'board' ? (
          <Board teamId={teamId} token={session?.backendToken} currentMember={currentMember} />
        ) : (
          <Metrics teamId={teamId} token={session?.backendToken} />
        )}
      </main>

    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
