'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { TeamMember } from '@/lib/types';
import { Trash2, Plus, Check, X, Shield, Pencil } from 'lucide-react';

const PERMISSION_LABELS: { key: keyof TeamMember; label: string; group: string }[] = [
  { key: 'canCreateCard', label: 'Criar card', group: 'Card' },
  { key: 'canEditCard', label: 'Editar card', group: 'Card' },
  { key: 'canRemoveCard', label: 'Remover card', group: 'Card' },
  { key: 'canCreateColumn', label: 'Criar coluna', group: 'Coluna' },
  { key: 'canEditColumn', label: 'Editar coluna', group: 'Coluna' },
  { key: 'canRemoveColumn', label: 'Remover coluna', group: 'Coluna' },
  { key: 'canAddMember', label: 'Adicionar membro', group: 'Time' },
  { key: 'canRemoveMember', label: 'Remover membro', group: 'Time' },
  { key: 'canRenameTeam', label: 'Renomear time', group: 'Time' },
];

export default function TeamSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const teamId = params.teamId as string;
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [editingPermissionsFor, setEditingPermissionsFor] = useState<string | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<Record<string, boolean>>({});
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [renamingTeam, setRenamingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (session?.backendToken && teamId) {
      fetchTeam();
    }
  }, [session, teamId]);

  const fetchTeam = async () => {
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      const team = await api.getTeam(teamId, session.backendToken);
      setCurrentTeam(team);
    } catch (err: any) {
      setError('Erro ao carregar time');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMember: TeamMember | undefined = currentTeam?.members?.find(
    (m: TeamMember) => m.userId === currentUserId,
  );
  const isOwner = currentMember?.isOwner ?? false;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!newMemberEmail.trim()) { setLocalError('Digite um email'); return; }
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      await api.addTeamMember(teamId, newMemberEmail, session.backendToken);
      setNewMemberEmail('');
      showSuccess('Membro adicionado com sucesso!');
      await fetchTeam();
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao adicionar membro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      await api.removeTeamMember(teamId, userId, session.backendToken);
      showSuccess('Membro removido com sucesso!');
      await fetchTeam();
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao remover membro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setLocalError('');
    if (!currentTeam) return;
    if (deleteConfirmation !== currentTeam.name) {
      setLocalError(`Digite o nome exato do time: ${currentTeam.name}`);
      return;
    }
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      await api.deleteTeam(teamId, session.backendToken);
      showSuccess('Time deletado com sucesso!');
      setTimeout(() => router.push('/teams'), 2000);
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao deletar time');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !session?.backendToken) return;
    try {
      setIsLoading(true);
      await api.renameTeam(teamId, newTeamName, session.backendToken);
      showSuccess('Time renomeado com sucesso!');
      setRenamingTeam(false);
      setNewTeamName('');
      await fetchTeam();
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao renomear time');
    } finally {
      setIsLoading(false);
    }
  };

  const openPermissions = (member: TeamMember) => {
    setEditingPermissionsFor(member.userId);
    const draft: Record<string, boolean> = {};
    PERMISSION_LABELS.forEach(({ key }) => {
      draft[key as string] = (member as any)[key] as boolean;
    });
    setPermissionDraft(draft);
  };

  const handleSavePermissions = async (userId: string) => {
    if (!session?.backendToken) return;
    try {
      setSavingPermissions(true);
      await api.updateMemberPermissions(teamId, userId, permissionDraft, session.backendToken);
      showSuccess('PermissÃµes atualizadas!');
      setEditingPermissionsFor(null);
      await fetchTeam();
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao salvar permissÃµes');
    } finally {
      setSavingPermissions(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groups = Array.from(new Set(PERMISSION_LABELS.map((p) => p.group)));

  return (
    <>
      <div>
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
            <div>
              <button
                onClick={() => router.back()}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2"
              >
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Configurações do Time
                </h1>
                {currentMember?.canRenameTeam && !renamingTeam && (
                  <button
                    onClick={() => { setRenamingTeam(true); setNewTeamName(currentTeam?.name || ''); }}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    title="Renomear time"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
              </div>
              {renamingTeam ? (
                <form onSubmit={handleRenameTeam} className="flex items-center gap-2 mt-2">
                  <input
                    autoFocus
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="text-green-600 hover:text-green-700"><Check className="w-5 h-5" /></button>
                  <button type="button" onClick={() => setRenamingTeam(false)} className="text-red-500 hover:text-red-600"><X className="w-5 h-5" /></button>
                </form>
              ) : (
                currentTeam && (
                  <p className="text-gray-600 dark:text-slate-400 mt-1">{currentTeam.name}</p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
          {/* Messages */}
          {(error || localError) && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error || localError}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-800 text-green-700 dark:text-emerald-300 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Add Member Section */}
          {currentMember?.canAddMember && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-800 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Adicionar Membro</h2>
              <form onSubmit={handleAddMember} className="flex gap-3">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
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
          )}

          {/* Members List */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Membros ({currentTeam?.members?.length || 0})
              </h2>
            </div>

            {currentTeam?.members && currentTeam.members.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-slate-800">
                {currentTeam.members.map((member: TeamMember) => (
                  <div key={member.id}>
                    <div className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">{member.user?.name}</p>
                          {member.isOwner && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                              <Shield className="w-3 h-3" /> Dono
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{member.user?.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Gerenciar permissÃµes: sÃ³ dono e nÃ£o pode editar o prÃ³prio dono */}
                        {isOwner && !member.isOwner && (
                          <button
                            onClick={() =>
                              editingPermissionsFor === member.userId
                                ? setEditingPermissionsFor(null)
                                : openPermissions(member)
                            }
                            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Permissoes
                          </button>
                        )}

                        {/* Remover membro */}
                        {currentMember?.canRemoveMember && !member.isOwner && member.userId !== currentUserId && (
                          <button
                            onClick={() => member.user && handleRemoveMember(member.user.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Painel de permissÃµes expandido */}
                    {editingPermissionsFor === member.userId && (
                      <div className="px-6 pb-6 bg-blue-50 dark:bg-slate-800/50 border-t border-blue-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 pt-4 mb-4">
                          Permissoes de {member.user?.name}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {groups.map((group) => (
                            <div key={group}>
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                                {group}
                              </p>
                              <div className="space-y-2">
                                {PERMISSION_LABELS.filter((p) => p.group === group).map(({ key, label }) => (
                                  <label
                                    key={key as string}
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!!permissionDraft[key as string]}
                                      onChange={(e) =>
                                        setPermissionDraft((prev) => ({ ...prev, [key as string]: e.target.checked }))
                                      }
                                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-5">
                          <button
                            onClick={() => handleSavePermissions(member.userId)}
                            disabled={savingPermissions}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            {savingPermissions ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setEditingPermissionsFor(null)}
                            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-600 dark:text-slate-400">
                Nenhum membro adicionado ainda
              </div>
            )}
          </div>

          {/* Delete Team Section - apenas para o dono */}
          {isOwner && (
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-lg shadow border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">Zona de Perigo</h2>
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
          )}

          {/* Delete Team Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Deletar Time &quot;{currentTeam?.name}&quot;?
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
                  <div className="text-sm text-red-600 dark:text-red-400 mb-4">{localError}</div>
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
                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); setLocalError(''); }}
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
    </>
  );
}
