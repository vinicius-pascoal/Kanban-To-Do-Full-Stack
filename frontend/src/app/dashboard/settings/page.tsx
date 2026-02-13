'use client';

import { useSession } from 'next-auth/react';
import GoogleCalendarSettings from '@/components/GoogleCalendarSettings';

export default function SettingsPage() {
  const { data: session, status } = useSession();

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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Configurações
          </h1>

          <div className="space-y-6">
            <GoogleCalendarSettings />

            {/* Placeholder para outras configurações futuras */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Outras Configurações
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Mais opções de configuração em breve...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
