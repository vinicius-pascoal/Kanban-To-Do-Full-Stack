'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Quadros Kanban',
    description: 'Colunas personalizáveis para organizar qualquer fluxo de trabalho.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Times colaborativos',
    description: 'Gerencie permissões e colabore com membros do seu time em tempo real.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Google Calendar',
    description: 'Sincronize prazos de cards automaticamente com sua agenda do Google.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Métricas de progresso',
    description: 'Visualize estatísticas do time e acompanhe o desempenho do projeto.',
  },
];

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/teams');
    }
  }, [session, status, router]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center justify-center p-4 py-12"
      style={{ backgroundImage: 'var(--login-bg)' }}
    >
      {/* Hero card */}
      <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-4xl border border-white/20 dark:border-white/10">
        <div className="text-center space-y-5">
          {/* Logo badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-300/30 backdrop-blur-sm mb-2">
            <img src="/imgs/logo-texto.png" alt="Planify" className="w-24 h-9 object-contain" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="text-white drop-shadow-lg">Organize tarefas em </span>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow">
              quadro Kanban
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Colabore com seu time, integre ao Google Calendar e acompanhe cada entrega com métricas em tempo real.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/register"
              className="px-9 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 hover:shadow-2xl text-base active:scale-95"
            >
              Criar conta grátis
            </Link>
            <Link
              href="/login"
              className="px-9 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-base active:scale-95"
            >
              Já tenho conta →
            </Link>
          </div>

          {status === 'loading' && (
            <p className="text-sm text-white/50 pt-1">Verificando sessão…</p>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mt-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-xl border border-white/15 dark:border-white/10 p-5 flex flex-col gap-3 hover:bg-white/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center text-cyan-300">
              {f.icon}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{f.title}</p>
              <p className="text-white/65 text-xs leading-relaxed mt-1">{f.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legal footer */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-white/50">
        <Link href="/privacy-policy" className="hover:text-cyan-300 transition-colors">
          Política de Privacidade
        </Link>
        <span className="text-white/20">•</span>
        <Link href="/terms-of-service" className="hover:text-cyan-300 transition-colors">
          Termos de Serviço
        </Link>
      </div>
    </div>
  );
}
