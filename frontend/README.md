# Frontend - Kanban To-Do

Interface do usuário para o sistema Kanban desenvolvida com Next.js, TypeScript, Tailwind CSS e Framer Motion.

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Certifique-se de que o arquivo `.env.local` contém:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Página principal do dashboard
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial (redireciona)
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── Board.tsx          # Componente do board Kanban
│   ├── Column.tsx         # Componente de coluna
│   ├── Card.tsx           # Componente de card
│   ├── CardModal.tsx      # Modal para criar/editar cards
│   └── Metrics.tsx        # Dashboard de métricas
└── lib/                   # Utilitários e configurações
    ├── types.ts           # Tipos TypeScript
    ├── api.ts             # Cliente da API
    ├── store.ts           # Estado global (Zustand)
    └── date-utils.ts      # Funções de manipulação de datas
```

## 🎨 Funcionalidades

### Board Kanban
- Visualização de cards em colunas (A Fazer, Em Progresso, Concluído)
- Criação, edição e exclusão de cards
- Indicadores visuais de status (atrasado, vence hoje, no prazo)
- Badges de prioridade (baixa, média, alta)

### Dashboard de Métricas
- Total de cards no sistema
- Cards concluídos
- Cards atrasados
- Cards que vencem hoje
- Distribuição de cards por coluna
- Tempo médio por coluna
- Cards concluídos por dia (últimos 7 dias)

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Zustand** - Gerenciamento de estado
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 🛠️ Scripts Disponíveis

- `npm run dev` - Roda o servidor de desenvolvimento
- `npm run build` - Compila a aplicação para produção
- `npm start` - Roda a aplicação compilada
- `npm run lint` - Executa o linter
