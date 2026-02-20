export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Política de Privacidade</h1>

      <section className="space-y-4 text-sm leading-6 text-gray-700">
        <p>
          Esta Política de Privacidade descreve como o Kanban To-Do coleta, usa e protege os dados
          pessoais dos usuários.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">1. Dados coletados</h2>
        <p>
          Podemos coletar informações de conta (nome, e-mail), dados de autenticação e dados
          necessários para integração com o Google Calendar.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">2. Uso dos dados</h2>
        <p>
          Os dados são usados para autenticação, funcionamento do quadro Kanban, sincronização de
          tarefas e criação/atualização de eventos no Google Calendar quando autorizado por você.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">3. Compartilhamento</h2>
        <p>
          Não vendemos seus dados pessoais. Compartilhamos dados somente quando necessário para
          prestação do serviço, cumprimento legal ou com seu consentimento.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">4. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não
          autorizado, alteração, divulgação ou destruição indevida.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">5. Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados, conforme legislação
          aplicável.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-gray-900">6. Contato</h2>
        <p>
          Para dúvidas sobre privacidade, entre em contato pelo e-mail de suporte informado no
          aplicativo.
        </p>

        <p className="pt-6 text-xs text-gray-500">Última atualização: 20/02/2026</p>
      </section>
    </main>
  );
}
