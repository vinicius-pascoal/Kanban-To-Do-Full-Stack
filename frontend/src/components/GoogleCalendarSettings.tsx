'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { googleCalendarApi } from '@/lib/api-client';
import { Calendar, CheckCircle, XCircle, RefreshCw, Link as LinkIcon, Unlink } from 'lucide-react';

export default function GoogleCalendarSettings() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<{
    connected: boolean;
    calendarId?: string;
    status?: string;
  }>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (session?.backendToken) {
      loadStatus();
    }
  }, [session]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await googleCalendarApi.getStatus();
      setStatus(data);
    } catch (err: any) {
      console.error('Error loading status:', err);
      setError(err.message || 'Erro ao carregar status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      setError('');
      const data = await googleCalendarApi.getConnectUrl();
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar');
      setActionLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      const data = await googleCalendarApi.sync();
      setSuccessMessage(`${data.synced} eventos sincronizados com sucesso!`);
      await loadStatus();
    } catch (err: any) {
      setError(err.message || 'Erro ao sincronizar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o Google Calendar?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await googleCalendarApi.disconnect();
      setSuccessMessage('Google Calendar desconectado com sucesso!');
      await loadStatus();
    } catch (err: any) {
      setError(err.message || 'Erro ao desconectar');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Integração Google Calendar
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sincronize seus cards do Kanban com o Google Calendar
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="border dark:border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.connected ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    Conectado
                  </p>
                  {status.calendarId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calendário: {status.calendarId}
                    </p>
                  )}
                  {status.status && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Status: {status.status}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    Não conectado
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conecte sua conta Google para sincronizar eventos
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {status.connected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors"
                >
                  <Unlink className="w-4 h-4" />
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Conectar Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Como funciona?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Cada card criado ou editado é sincronizado automaticamente com o Google Calendar</li>
          <li>A data de vencimento do card é usada como data do evento</li>
          <li>O título e descrição do card são sincronizados com o evento</li>
          <li>Mudanças no Google Calendar são sincronizadas de volta para o Kanban</li>
          <li>Webhooks garantem que as alterações sejam refletidas em tempo real</li>
        </ul>
      </div>
    </div>
  );
}
