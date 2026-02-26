'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CalendarSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [calendarAuthUrl, setCalendarAuthUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const init = async () => {
      try {
        // Verificar se já está conectado ao Google Calendar
        const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/status`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.connected) {
            // Já conectado, ir direto para o dashboard
            router.push('/dashboard');
            return;
          }
        }

        // Não conectado — buscar URL de autorização
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar/connect-url`, {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar URL de autorização');
        }

        const data = await response.json();
        setCalendarAuthUrl(data.url);
      } catch (err: any) {
        console.error('Erro:', err);
        setError(err.message || 'Erro ao buscar autorização do Google Calendar');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [session, status, router]);

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleConnect = () => {
    if (calendarAuthUrl) {
      window.location.href = calendarAuthUrl;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Conectar Google Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sincronize seus cards do Kanban com o Google Calendar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            Ao conectar, você permite que nos sincronizemos seus cards com o Google Calendar automaticamente.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConnect}
            disabled={!calendarAuthUrl || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            Conectar Google Calendar
          </button>

          <button
            onClick={handleSkip}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg transition-colors"
          >
            Pular por enquanto
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Você pode conectar o Google Calendar depois nas configurações da conta.
        </p>
      </div>
    </div>
  );
}
