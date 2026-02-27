import Link from 'next/link';

const sections = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Dados coletados',
    content:
      'Podemos coletar informações de conta (nome, e-mail), dados de autenticação e dados necessários para integração com o Google Calendar.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Uso dos dados',
    content:
      'Os dados são usados para autenticação, funcionamento do quadro Kanban, sincronização de tarefas e criação/atualização de eventos no Google Calendar quando autorizado por você.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: 'Compartilhamento',
    content:
      'Não vendemos seus dados pessoais. Compartilhamos dados somente quando necessário para prestação do serviço, cumprimento legal ou com seu consentimento.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Segurança',
    content:
      'Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, alteração, divulgação ou destruição indevida.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Seus direitos',
    content:
      'Você pode solicitar acesso, correção ou exclusão dos seus dados, conforme legislação aplicável.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Contato',
    content:
      'Para dúvidas sobre privacidade, entre em contato pelo e-mail de suporte informado no aplicativo.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4 py-12"
      style={{ backgroundImage: 'var(--login-bg)' }}
    >
      <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-2xl shadow-2xl w-full max-w-3xl border border-white/20 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-white/10 px-8 py-7">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white text-sm font-medium transition-colors mb-5 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center text-cyan-300 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Política de Privacidade</h1>
              <p className="text-white/50 text-xs mt-0.5">Última atualização: 20/02/2026</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 space-y-2">
          <p className="text-white/75 text-sm leading-relaxed mb-5">
            Esta Política de Privacidade descreve como o Kanban To-Do coleta, usa e protege os dados pessoais dos usuários.
          </p>

          <div className="space-y-3">
            {sections.map((s, i) => (
              <div
                key={s.title}
                className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-colors"
              >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center text-cyan-300">
                  {s.icon}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{s.title}</p>
                  <p className="text-white/65 text-sm leading-relaxed">{s.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
