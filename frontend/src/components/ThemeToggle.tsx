'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg backdrop-blur-md transition-all hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/70 dark:text-gray-100 dark:hover:bg-slate-900/80"
    >
      <span className="text-base" aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </span>
      {isDark ? 'Escuro' : 'Claro'}
    </button>
  );
}
