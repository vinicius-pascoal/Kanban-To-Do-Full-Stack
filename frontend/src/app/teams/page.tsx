'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ProtectedRoute } from '@/lib/auth-provider';
import Link from 'next/link';

function TeamsContent() {
  const router = useRouter();
  const { user, teams, currentTeam, fetchTeams, createTeam, isLoading, error } = useAuth();
  const [newTeamName, setNewTeamName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!newTeamName.trim()) {
      setLocalError('Digite um nome para o time');
      return;
    }

    try {
      await createTeam(newTeamName);
      setNewTeamName('');
      setShowCreateForm(false);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleSelectTeam = (teamId: string) => {
    router.push(`/dashboard/${teamId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Error */}
        {(error || localError) && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || localError}
          </div>
        )}

        {/* Teams Grid */}
        {teams && teams.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Times ({teams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
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
              ))}
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
  );
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsContent />
    </ProtectedRoute>
  );
}
