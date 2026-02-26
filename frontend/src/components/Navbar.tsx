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
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-full mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">

          {/* Logo e Nome */}
          <div className="pointer-events-auto">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-white/25 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/40 dark:border-slate-600/40 shadow-lg hover:bg-white/40 dark:hover:bg-slate-900/55 transition-all"
            >
              <div className="flex flex-col">
                <img src="/imgs/logo-texto.png" className='w-24 h-6 object-contain' />
              </div>
            </Link>
          </div>

          {/* Links de navegação */}
          <div className="hidden md:flex items-center gap-1 bg-white/25 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl px-2 py-2 border border-white/40 dark:border-slate-600/40 shadow-lg pointer-events-auto">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${pathname === '/dashboard'
                ? 'bg-white/50 dark:bg-white/15 text-white shadow-sm'
                : 'text-white/80 hover:bg-white/25 dark:hover:bg-white/10 hover:text-white'
                }`}
            >
              <Home className="w-4 h-4 drop-shadow" />
              <span className="drop-shadow">Home</span>
            </Link>

            <Link
              href="/teams"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${pathname === '/teams'
                ? 'bg-white/50 dark:bg-white/15 text-white shadow-sm'
                : 'text-white/80 hover:bg-white/25 dark:hover:bg-white/10 hover:text-white'
                }`}
            >
              <Users className="w-4 h-4 drop-shadow" />
              <span className="drop-shadow">Times</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-sm font-medium ${pathname === '/dashboard/settings'
                ? 'bg-white/50 dark:bg-white/15 text-white shadow-sm'
                : 'text-white/80 hover:bg-white/25 dark:hover:bg-white/10 hover:text-white'
                }`}
            >
              <Settings className="w-4 h-4 drop-shadow" />
              <span className="drop-shadow">Configurações</span>
            </Link>
          </div>

          {/* Lado direito - User info, Theme Toggle e Logout */}
          <div className="flex items-center gap-2 bg-white/25 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/40 dark:border-slate-600/40 shadow-lg pointer-events-auto">
            {/* Nome do usuário */}
            <div className="hidden sm:block text-sm text-white drop-shadow mr-1">
              <span className="font-semibold">{session.user?.name || session.user?.email}</span>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/35 dark:hover:bg-white/20 px-2.5 py-1.5 text-sm font-semibold text-white transition-all"
            >
              <span className="text-base" aria-hidden="true">
                {isDark ? '🌙' : '☀️'}
              </span>
              <span className="hidden sm:inline">{isDark ? 'Escuro' : 'Claro'}</span>
            </button>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-white/80 hover:text-white hover:bg-red-500/30 rounded-xl transition-all"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4 drop-shadow" />
              <span className="hidden sm:inline text-sm font-medium">Sair</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
