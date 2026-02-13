'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      // Register via backend API
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao cadastrar');
        setIsLoading(false);
        return;
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Cadastro realizado, mas houve erro no login');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Erro ao cadastrar');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Erro ao cadastrar com Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full min-h-0 bg-cover bg-center bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: 'var(--login-bg)' }}>
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

          {error && (
            <div className="bg-red-500/30 border border-red-400/50 text-red-50 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
              {error}
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 backdrop-blur-sm bg-white/10 text-white/70">Ou continuar com</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLoading ? 'Cadastrando...' : 'Continuar com Google'}
          </button>
        </div>

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
