'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TeamsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session?.backendToken) {
      fetchTeams();
    }
  }, [session]);

  const fetchTeams = async () => {
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      const data = await api.getTeams(session.backendToken);
      setTeams(data);
    } catch (err: any) {
      setError('Erro ao carregar times');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTeamName.trim()) {
      setError('Digite um nome para o time');
      return;
    }

    if (!session?.backendToken) return;

    try {
      setIsLoading(true);
      await api.createTeam(newTeamName, session.backendToken);
      setNewTeamName('');
      setShowCreateForm(false);
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTeam = (teamId: string) => {
    router.push(`/dashboard/${teamId}`);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTeams = (teams || []).filter((team) =>
    team.name.toLowerCase().includes(normalizedQuery)
  );

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-scroll" style={{ backgroundImage: 'var(--login-bg)' }}>
        {/* Content */}
        <div className="max-w-full mx-auto px-4 py-12">
          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

        {/* Search */}
        {teams && teams.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar time
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome do time"
              className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
        )}

        {/* Teams Grid */}
        {teams && teams.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Times ({filteredTeams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => handleSelectTeam(team.id)}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {team.members?.length || 0} membro{
                          (team.members?.length || 0) !== 1 ? 's' : ''
                        }
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {team.members?.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {member.user?.name}
                          </div>
                        ))}
                        {(team.members?.length || 0) > 3 && (
                          <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{(team.members?.length || 0) - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-3 text-center">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm">
                        Abrir →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                  Nenhum time encontrado para "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Você não tem nenhum time ainda</p>
          </div>
        )}

        {/* Create Team Section */}
        <div className="mt-8">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              + Criar novo time
            </button>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Criar novo time
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do time
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Ex: Frontend Team"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Criando...' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
