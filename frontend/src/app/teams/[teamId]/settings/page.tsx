'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, ProtectedRoute } from '@/lib/auth-provider';
import { Trash2, Plus } from 'lucide-react';

function TeamSettingsContent() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { currentTeam, fetchTeam, addTeamMember, removeTeamMember, token, isLoading, error } = useAuth();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
