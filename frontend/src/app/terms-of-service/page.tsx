import Link from 'next/link';

const sections = [
  {
    title: 'Uso da plataforma',
    content:
      'Você concorda em utilizar a plataforma de forma lícita, sem violar direitos de terceiros ou comprometer a segurança do serviço.',
  },
  {
    title: 'Conta do usuário',
    content:
      'Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas na sua conta.',
  },
  {
    title: 'Integração com Google',
    content:
      'Ao conectar sua conta Google, você autoriza o aplicativo a acessar os escopos informados para sincronização com o Google Calendar.',
  },
  {
    title: 'Limitação de responsabilidade',
    content:
      'O serviço é fornecido como disponível. Não garantimos disponibilidade ininterrupta e não nos responsabilizamos por danos indiretos decorrentes do uso da plataforma, salvo disposição legal.',
  },
  {
    title: 'Alterações',
    content:
      'Estes termos podem ser atualizados periodicamente. A continuidade de uso após alterações representa aceitação dos novos termos.',
  },
  {
    title: 'Contato',
    content:
      'Para dúvidas sobre estes termos, utilize o canal de suporte informado no aplicativo.',
  },
];

export default function TermsOfServicePage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Termos de Serviço</h1>
              <p className="text-white/50 text-xs mt-0.5">Última atualização: 20/02/2026</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 space-y-2">
          <p className="text-white/75 text-sm leading-relaxed mb-5">
            Estes Termos de Serviço regem o uso do Kanban To-Do. Ao usar o aplicativo, você concorda com estes termos.
          </p>

          <div className="space-y-3">
            {sections.map((s, i) => (
              <div
                key={s.title}
                className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-colors"
              >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border border-cyan-300/20 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {i + 1}
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
