import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: 'var(--login-bg)' }}>
      <div className="backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-4xl border border-white/20 dark:border-white/10 my-8">
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center text-cyan-300 hover:text-cyan-200 font-medium transition-colors text-sm"
          >
            ← Voltar para home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            Termos de Serviço
          </h1>

          <div className="space-y-4 text-sm leading-6 text-white/90">
            <p>
              Estes Termos de Serviço regem o uso do Kanban To-Do. Ao usar o aplicativo, você concorda
              com estes termos.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">1. Uso da plataforma</h2>
            <p>
              Você concorda em utilizar a plataforma de forma lícita, sem violar direitos de terceiros
              ou comprometer a segurança do serviço.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">2. Conta do usuário</h2>
            <p>
              Você é responsável por manter a confidencialidade de suas credenciais e por todas as
              atividades realizadas na sua conta.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">3. Integração com Google</h2>
            <p>
              Ao conectar sua conta Google, você autoriza o aplicativo a acessar os escopos informados
              para sincronização com o Google Calendar.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">4. Limitação de responsabilidade</h2>
            <p>
              O serviço é fornecido como disponível. Não garantimos disponibilidade ininterrupta e não
              nos responsabilizamos por danos indiretos decorrentes do uso da plataforma, salvo disposição legal.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">5. Alterações</h2>
            <p>
              Estes termos podem ser atualizados periodicamente. A continuidade de uso após alterações
              representa aceitação dos novos termos.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">6. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, utilize o canal de suporte informado no aplicativo.
            </p>

            <p className="pt-6 text-xs text-white/60">Última atualização: 20/02/2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
