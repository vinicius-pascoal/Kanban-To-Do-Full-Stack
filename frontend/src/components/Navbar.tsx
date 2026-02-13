'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Home, Users, LogOut, Settings } from 'lucide-react';

const THEME_KEY = 'theme';
type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, mounted]);

  // Load current team from localStorage
  useEffect(() => {
    if (session?.backendToken) {
      const storedTeam = localStorage.getItem('currentTeam');
      if (storedTeam) {
        try {
          setCurrentTeam(JSON.parse(storedTeam));
        } catch (e) {
          console.error('Error parsing currentTeam:', e);
        }
      }
    }
  }, [session]);

  const handleLogout = async () => {
    localStorage.removeItem('currentTeam');
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const isDark = theme === 'dark';

  // Não mostrar navbar nas páginas de login e registro
  if (status === 'loading') {
    return null;
  }

  if (!session || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  Planify
                </span>
                {currentTeam && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Time: {currentTeam.name}
                  </span>
                )}
              </div>
            </Link>

            {/* Links de navegação */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                href="/teams"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${pathname === '/teams'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>Times</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard/settings'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </Link>
            </div>
          </div>

          {/* Lado direito - User info, Theme Toggle e Logout */}
          <div className="flex items-center gap-4">
            {/* Nome do usuário */}
            <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{session.user?.name || session.user?.email}</span>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <span className="text-base" aria-hidden="true">
                {isDark ? '🌙' : '☀️'}
              </span>
              <span className="hidden sm:inline">{isDark ? 'Escuro' : 'Claro'}</span>
            </button>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
