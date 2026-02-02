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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Times</h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.name}</p>
          </div>
          <Link
            href="/api/auth/logout"
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sair
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Error */}
        {(error || localError) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || localError}
          </div>
        )}

        {/* Teams Grid */}
        {teams && teams.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Times ({teams.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {team.members?.length || 0} membro{
                        (team.members?.length || 0) !== 1 ? 's' : ''
                      }
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {team.members?.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {member.user?.name}
                        </div>
                      ))}
                      {(team.members?.length || 0) > 3 && (
                        <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{(team.members?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 px-6 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      Abrir →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Você não tem nenhum time ainda</p>
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
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Criar novo time
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do time
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Ex: Frontend Team"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
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
