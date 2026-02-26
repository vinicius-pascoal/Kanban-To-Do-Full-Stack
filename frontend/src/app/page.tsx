'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/teams');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: 'var(--login-bg)' }}>
      <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-2xl shadow-2xl p-10 w-full max-w-4xl border border-white/20 dark:border-white/10">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-300/30 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">planify-kanban</p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight">
            Organize tarefas em quadro Kanban
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Colabore com seu time e integre com Google Calendar.
            Planeje trabalho em colunas, acompanhe prazos e meça progresso em tempo real.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl backdrop-blur-sm text-lg"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl backdrop-blur-sm text-lg"
            >
              Criar conta
            </Link>
          </div>

          <div className="pt-12 border-t border-white/20 mt-12">
            <p className="text-sm text-white/70 mb-3">Informações legais</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href="/privacy-policy"
                className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors underline underline-offset-4"
              >
                Política de Privacidade
              </Link>
              <span className="text-white/30">•</span>
              <Link
                href="/terms-of-service"
                className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors underline underline-offset-4"
              >
                Termos de Serviço
              </Link>
            </div>
          </div>

          {status === 'loading' && (
            <p className="text-sm text-white/60 pt-4">Verificando sessão...</p>
          )}
        </div>
      </div>
    </div>
  );
}
