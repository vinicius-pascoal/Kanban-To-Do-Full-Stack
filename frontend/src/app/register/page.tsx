'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: 'var(--login-bg)' }}>
      <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 dark:border-white/10">
        <h1 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
          Cadastre-se
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-white/30 outline-none bg-white/5 dark:bg-slate-800/60 text-white placeholder-white/50 backdrop-blur-sm transition-all"
              placeholder="Seu nome"
            />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/70">
          Já tem conta?{' '}
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
