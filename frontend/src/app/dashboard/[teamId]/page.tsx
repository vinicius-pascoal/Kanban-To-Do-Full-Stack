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
  const teamId = params.teamId as string;
  const { user, currentTeam, fetchTeam, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'board' | 'metrics'>('board');

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/teams" className="text-2xl font-bold text-gray-800 hover:text-blue-600">
              📌 Kanban To-Do
            </Link>
            {currentTeam && (
              <p className="text-sm text-gray-600 mt-1">
                Time: <span className="font-semibold">{currentTeam.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'board'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Board Kanban
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'metrics'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              Métricas
            </button>
            <button
              onClick={() => router.push(`/teams/${teamId}/settings`)}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 border-transparent border-b-2"
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
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          Desenvolvido com Next.js, TypeScript, Tailwind CSS e SQLite
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
