import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            Política de Privacidade
          </h1>

          <div className="space-y-4 text-sm leading-6 text-white/90">
            <p>
              Esta Política de Privacidade descreve como o Kanban To-Do coleta, usa e protege os dados
              pessoais dos usuários.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">1. Dados coletados</h2>
            <p>
              Podemos coletar informações de conta (nome, e-mail), dados de autenticação e dados
              necessários para integração com o Google Calendar.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">2. Uso dos dados</h2>
            <p>
              Os dados são usados para autenticação, funcionamento do quadro Kanban, sincronização de
              tarefas e criação/atualização de eventos no Google Calendar quando autorizado por você.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">3. Compartilhamento</h2>
            <p>
              Não vendemos seus dados pessoais. Compartilhamos dados somente quando necessário para
              prestação do serviço, cumprimento legal ou com seu consentimento.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">4. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não
              autorizado, alteração, divulgação ou destruição indevida.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">5. Seus direitos</h2>
            <p>
              Você pode solicitar acesso, correção ou exclusão dos seus dados, conforme legislação
              aplicável.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-white">6. Contato</h2>
            <p>
              Para dúvidas sobre privacidade, entre em contato pelo e-mail de suporte informado no
              aplicativo.
            </p>

            <p className="pt-6 text-xs text-white/60">Última atualização: 20/02/2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
