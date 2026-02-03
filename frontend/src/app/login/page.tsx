'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      router.push('/teams');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: 'var(--login-bg)' }}>
      <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 dark:border-white/10">
        <h1 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
          Entrar
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-white/30 outline-none bg-white/5 dark:bg-slate-800/60 text-white placeholder-white/50 backdrop-blur-sm transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-white/30 outline-none bg-white/5 dark:bg-slate-800/60 text-white placeholder-white/50 backdrop-blur-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          {(error || localError) && (
            <div className="bg-red-500/30 border border-red-400/50 text-red-50 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 rounded-lg transition-all shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/70">
          Não tem conta?{' '}
          <Link href="/register" className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
