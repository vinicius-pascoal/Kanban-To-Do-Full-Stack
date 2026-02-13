'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import GoogleCalendarSettings from '@/components/GoogleCalendarSettings';
import { api } from '@/lib/api';
import { User, Mail, Lock, Save, Key } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validações
      if (!name.trim()) {
        setError('Nome é obrigatório');
        setIsLoading(false);
        return;
      }

      if (!email.trim()) {
        setError('Email é obrigatório');
        setIsLoading(false);
        return;
      }

      if (newPassword && newPassword !== confirmPassword) {
        setError('As senhas não coincidem');
        setIsLoading(false);
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        setIsLoading(false);
        return;
      }

      // Preparar dados para atualização
      const updateData: any = {};

      if (name !== session?.user?.name) {
        updateData.name = name;
      }

      if (email !== session?.user?.email) {
        updateData.email = email;
      }

      if (newPassword) {
        updateData.password = newPassword;
      }

      // Verificar se há algo para atualizar
      if (Object.keys(updateData).length === 0) {
        setError('Nenhuma alteração detectada');
        setIsLoading(false);
        return;
      }

      // Atualizar perfil
      const result = await api.updateProfile(updateData, session?.backendToken || '');

      // Se o email foi alterado, novo token foi gerado
      if (result.token) {
        // Atualizar sessão com novo token
        await update({
          ...session,
          user: {
            ...session?.user,
            name: result.user.name,
            email: result.user.email,
          },
          backendToken: result.token,
        });

        // Se email mudou, deslogar e pedir novo login
        setSuccess('Email atualizado! Por favor, faça login novamente.');
        setTimeout(() => {
          signOut({ callbackUrl: '/login' });
        }, 2000);
      } else {
        // Atualizar sessão
        await update({
          ...session,
          user: {
            ...session?.user,
            name: result.user.name,
            email: result.user.email,
          },
        });

        setSuccess('Perfil atualizado com sucesso!');
        setIsEditing(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(session?.user?.name || '');
    setEmail(session?.user?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  // Middleware handles authentication - no manual redirect needed

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto ">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Configurações
          </h1>

          <div className="space-y-6">
            {/* User Profile Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil do Usuário
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Editar Perfil
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Nome
                    </label>
                    <p className="text-gray-900 dark:text-white">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">{session?.user?.email}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Deixe em branco se não quiser alterar a senha
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                          placeholder="Nova senha (mínimo 6 caracteres)"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-gray-400 text-gray-700 dark:text-gray-200 font-semibold py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            <GoogleCalendarSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
