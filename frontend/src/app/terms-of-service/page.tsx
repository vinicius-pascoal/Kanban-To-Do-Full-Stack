export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Termos de Serviço</h1>

      <section className="space-y-4 text-sm leading-6 text-gray-700">
        <p>
          Estes Termos de Serviço regem o uso do Kanban To-Do. Ao usar o aplicativo, você concorda
          com estes termos.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">1. Uso da plataforma</h2>
        <p>
          Você concorda em utilizar a plataforma de forma lícita, sem violar direitos de terceiros
          ou comprometer a segurança do serviço.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">2. Conta do usuário</h2>
        <p>
          Você é responsável por manter a confidencialidade de suas credenciais e por todas as
          atividades realizadas na sua conta.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">3. Integração com Google</h2>
        <p>
          Ao conectar sua conta Google, você autoriza o aplicativo a acessar os escopos informados
          para sincronização com o Google Calendar.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">4. Limitação de responsabilidade</h2>
        <p>
          O serviço é fornecido como disponível. Não garantimos disponibilidade ininterrupta e não
          nos responsabilizamos por danos indiretos decorrentes do uso da plataforma, salvo disposição legal.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">5. Alterações</h2>
        <p>
          Estes termos podem ser atualizados periodicamente. A continuidade de uso após alterações
          representa aceitação dos novos termos.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">6. Contato</h2>
        <p>
          Para dúvidas sobre estes termos, utilize o canal de suporte informado no aplicativo.
        </p>

        <p className="pt-6 text-xs text-gray-500">Última atualização: 20/02/2026</p>
      </section>
    </main>
  );
}
