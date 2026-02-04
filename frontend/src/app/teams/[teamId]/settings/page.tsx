'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, ProtectedRoute } from '@/lib/auth-provider';
import { Trash2, Plus } from 'lucide-react';

function TeamSettingsContent() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { currentTeam, fetchTeam, addTeamMember, removeTeamMember, deleteTeam, token, isLoading, error } = useAuth();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (token && teamId) {
      fetchTeam(teamId);
    }
  }, [token, teamId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!newMemberEmail.trim()) {
      setLocalError('Digite um email');
      return;
    }

    try {
      await addTeamMember(newMemberEmail);
      setNewMemberEmail('');
      setSuccessMessage('Membro adicionado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await removeTeamMember(userId);
      setSuccessMessage('Membro removido com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleDeleteTeam = async () => {
    setLocalError('');
    
    if (!currentTeam) return;
    
    if (deleteConfirmation !== currentTeam.name) {
      setLocalError(`Digite o nome exato do time: ${currentTeam.name}`);
      return;
    }

    try {
      await deleteTeam(teamId);
      setSuccessMessage('Time deletado com sucesso!');
      setTimeout(() => router.push('/teams'), 2000);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 mb-2"
            >
              ← Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações do Time
            </h1>
            {currentTeam && (
              <p className="text-gray-600 mt-1">
                {currentTeam.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Messages */}
        {(error || localError) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || localError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Add Member Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Adicionar Membro
          </h2>
          <form onSubmit={handleAddMember} className="flex gap-3">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white text-gray-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Membros ({currentTeam?.members?.length || 0})
            </h2>
          </div>

          {currentTeam?.members && currentTeam.members.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {currentTeam.members.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => member.user && handleRemoveMember(member.user.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-600">
              Nenhum membro adicionado ainda
            </div>
          )}
        </div>

        {/* Delete Team Section */}
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-lg shadow border border-red-200 dark:border-red-800 p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
            Zona de Perigo
          </h2>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Deletar um time é uma ação irreversível. Todos os cards e dados serão perdidos.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Deletar Time
          </button>
        </div>

        {/* Delete Team Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Deletar Time "{currentTeam?.name}"?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Esta ação é irreversível. Digite o nome do time para confirmar:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={`Digite: ${currentTeam?.name}`}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none mb-4"
              />
              {localError && (
                <div className="text-sm text-red-600 dark:text-red-400 mb-4">
                  {localError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteTeam}
                  disabled={isLoading || deleteConfirmation !== currentTeam?.name}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {isLoading ? 'Deletando...' : 'Deletar Permanentemente'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                    setLocalError('');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamSettingsPage() {
  return (
    <ProtectedRoute>
      <TeamSettingsContent />
    </ProtectedRoute>
  );
}
