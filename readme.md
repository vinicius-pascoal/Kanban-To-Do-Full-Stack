# 📌 Kanban To-Do Full Stack

Um sistema **Kanban completo** para gerenciamento de tarefas em equipe, unindo **Kanban visual**, **controle por datas**, **autenticação JWT**, **métricas de produtividade** e **analytics avançado**, desenvolvido como **projeto Full Stack** com **Next.js**, **Express.js** e **SQLite**.

Projeto ideal para portfólio, demonstrando arquitetura moderna, regras de negócio complexas, persistência real de dados, segurança com autenticação e visualização avançada de informações.

## ✅ Status do Projeto

**Projeto Completo e Funcional!** ✨

Todas as features principais foram implementadas e testadas:
- ✅ Backend com API REST, Prisma ORM, SQLite e autenticação JWT
- ✅ Frontend com Next.js 14 (App Router), TypeScript e Tailwind CSS
- ✅ Sistema de autenticação com registro e login
- ✅ Gerenciamento de times e membros
- ✅ Kanban board completo com drag & drop
- ✅ Cards com prioridade, datas, atribuição de usuários
- ✅ Modal detalhado de cards com histórico completo
- ✅ Dashboard de métricas com Recharts (Power BI-style)
- ✅ Análise de produtividade por membro
- ✅ Componentes animados com Framer Motion
- ✅ Validação de dados com Zod

---

## 🎯 Objetivo

Criar uma aplicação Kanban profissional que permita:

* Organizar tarefas em colunas customizáveis
* Controlar prazos com alertas visuais
* Atribuir tarefas a membros do time
* Visualizar métricas reais de produtividade
* Registrar histórico de movimentações
* Gerenciar múltiplos times e projetos
* Persistir dados em banco relacional (SQLite)

---

## 🚀 Funcionalidades Principais

### 🔐 Autenticação
* Registro e login de usuários com JWT
* Tokens seguros com expiração
* Proteção de rotas com middleware
* Recuperação de sessão automática

### 👥 Gerenciamento de Times
* Criar e gerenciar times
* Adicionar/remover membros
* Atribuir tarefas a membros específicos
* Visualizar produtividade por membro

### ✅ Kanban Board
* Colunas fixas: **A Fazer**, **Em Progresso**, **Concluído**
* Criar, editar e remover cards
* **Drag & drop** animado entre colunas
* Reordenação de cards dentro da coluna
* Histórico completo de movimentações

### 📅 Gerenciamento de Datas
Cada card possui:
* Data de criação (automática)
* Data de vencimento (optional)
* Data de atualização (automática)
* Histórico de todas as movimentações

**Indicadores Visuais**
* 🔴 **Atrasado** - Prazo passou
* 🟡 **Vence hoje** - Entrega no mesmo dia
* 🟢 **No prazo** - Ainda dentro do prazo
* ✅ **Concluído** - Tarefa finalizada

### 🏷️ Prioridades
* **Baixa** (Azul)
* **Média** (Amarelo)
* **Alta** (Vermelho)

### 👤 Atribuição de Usuários
* Atribuir cards a membros do time
* Visualizar nome e email do responsável
* Filtrar por membro (futuro)

### 📊 Dashboard de Métricas
Dashboard avançado com visualizações interativas:

**KPIs (Key Performance Indicators)**
* Total de cards
* Taxa de conclusão (%)
* Cards atrasados (%)
* Cards vencendo hoje

**Visualizações Gráficas (Recharts)**
* 🥧 **Pie Chart** - Distribuição de cards por coluna
* 📊 **Bar Chart** - Conclusões por dia
* 📈 **Line Chart** - Tempo médio por coluna
* 📋 **Composed Chart** - Status dos cards (stacked)

**Análise de Produtividade**
* Cards criados por membro
* Cards concluídos por membro
* Cards em progresso por membro
* Tempo médio de conclusão por membro
* Tabela detalhada com rankings

### 🔍 Detalhes do Card
Modal expansível que mostra:
* Título e descrição completos
* Prioridade com badge colorido
* Usuário atribuído com avatar
* Data de vencimento com countdown
* Status atual (atrasado, hoje, no prazo, concluído)
* Histórico de movimentações (de qual coluna para qual)
* Data de criação e última atualização
* ID único do card
* Botões de ação (editar, deletar)

---

## 🧠 Regras de Negócio

* Um card pertence a apenas uma coluna
* Um card pode ser atribuído a no máximo um usuário
* Ao mover um card:
  - Atualiza data de modificação
  - Registra no histórico (de → para)
* Cards concluídos não entram em atraso
* Datas tratadas sem offset de timezone (sempre noon UTC)
* Apenas membros do time podem ser atribuídos
* Métricas atualizadas em tempo real

---

## 🛠️ Stack Utilizada

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (type-safe)
- **Tailwind CSS** (utility-first styling)
- **Framer Motion** (animations & drag-drop)
- **Recharts** (interactive charts)
- **Lucide React** (icons)
- **Zustand** (state management)
- **Zod** (validation)

### Backend
- **Express.js** (HTTP server)
- **TypeScript** (type-safe)
- **Prisma ORM** (database)
- **SQLite** (lightweight DB)
- **JWT** (authentication)
- **Zod** (validation)

### Database Schema
- **User** - Dados de usuário
- **Team** - Times/Projetos
- **TeamMember** - Relação usuário-time
- **Board** - Quadro Kanban
- **Column** - Colunas do board
- **Card** - Tarefas/Cards
- **CardHistory** - Histórico de movimentações

---

## 🔌 Endpoints da API

### Autenticação
```http
POST   /api/auth/register    # Registrar novo usuário
POST   /api/auth/login       # Login e obter JWT
```

### Board
```http
GET    /api/board            # Buscar board com todas as colunas e cards
POST   /api/board            # Criar novo board
```

### Cards
```http
POST   /api/card             # Criar novo card
GET    /api/card/:id         # Buscar card específico
PUT    /api/card/:id         # Atualizar card
DELETE /api/card/:id         # Deletar card
POST   /api/card/move        # Mover card entre colunas
```

### Colunas
```http
POST   /api/column           # Criar nova coluna
DELETE /api/column/:id       # Deletar coluna
```

### Métricas
```http
GET    /api/metrics          # Buscar todas as métricas e produtividade
```

### Teams
```http
POST   /api/team             # Criar novo time
GET    /api/team/:id         # Buscar time com membros
POST   /api/team/:id/member  # Adicionar membro ao time
DELETE /api/team/:id/member  # Remover membro do time
```

---

## 📁 Estrutura do Projeto

```
Kanban-To-Do-Full-Stack/
├── backend/                          # Backend Express.js
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts              # Rotas de autenticação
│   │   │   ├── board.ts             # Rotas do board
│   │   │   ├── card.ts              # Rotas de cards
│   │   │   ├── column.ts            # Rotas de colunas
│   │   │   ├── metrics.ts           # Rotas de métricas
│   │   │   └── team.ts              # Rotas de teams
│   │   ├── lib/
│   │   │   ├── auth-middleware.ts   # Middleware JWT
│   │   │   ├── auth-validations.ts  # Validações de auth
│   │   │   ├── date-utils.ts        # Utilitários de data
│   │   │   ├── jwt.ts               # Funções JWT
│   │   │   ├── prisma.ts            # Cliente Prisma
│   │   │   └── validations.ts       # Schemas Zod
│   │   └── server.ts                # Servidor Express
│   ├── prisma/
│   │   └── schema.prisma            # Schema do banco
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Home/Redirect
│   │   │   ├── layout.tsx           # Layout raiz
│   │   │   ├── globals.css          # Estilos globais
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Página de login
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Página de registro
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Dashboard principal
│   │   │   ├── teams/
│   │   │   │   └── page.tsx         # Gerenciamento de times
│   │   │   └── teams/[teamId]/
│   │   │       ├── page.tsx         # Board do time
│   │   │       └── settings/
│   │   │           └── page.tsx     # Configurações do time
│   │   ├── components/
│   │   │   ├── Board.tsx            # Componente principal do board
│   │   │   ├── Column.tsx           # Coluna com cards
│   │   │   ├── Card.tsx             # Card individual
│   │   │   ├── CardModal.tsx        # Modal de criar/editar card
│   │   │   ├── CardDetailModal.tsx  # Modal com detalhes do card
│   │   │   └── Metrics.tsx          # Dashboard de métricas
│   │   └── lib/
│   │       ├── api.ts               # Client API
│   │       ├── auth-provider.tsx    # Auth context
│   │       ├── auth-store.ts        # Auth state
│   │       ├── store.ts             # Zustand store (board)
│   │       ├── date-utils.ts        # Utilitários de data
│   │       └── types.ts             # Types TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── readme.md                         # Este arquivo
├── SETUP_AUTH.md                     # Guia de setup de auth
├── TEST_GUIDE.md                     # Guia de testes
└── IMPLEMENTATION_SUMMARY.md         # Resumo de implementação
```

---

## ▶️ Como Executar

### 1️⃣ Clonar e Preparar

```bash
# Clonar repositório
git clone <repo-url>
cd Kanban-To-Do-Full-Stack

# Instalar dependências (backend)
cd backend && npm install

# Instalar dependências (frontend)
cd ../frontend && npm install
```

### 2️⃣ Backend

```bash
cd backend

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Rodar servidor (desenvolvimento)
npm run dev
```

Backend estará em `http://localhost:3001`

### 3️⃣ Frontend

```bash
cd frontend

# Rodar servidor de desenvolvimento
npm run dev
```

Frontend estará em `http://localhost:3000`

### 4️⃣ Usar a Aplicação

1. Acesse `http://localhost:3000`
2. Registre uma conta nova ou faça login
3. Crie um time
4. Adicione membros ao time
5. Comece a criar cards e organizá-los!

---

## 🧪 Testes

Para testar as funcionalidades:

### Fluxo de Autenticação
1. Registre um novo usuário
2. Faça login
3. Acesse o dashboard
4. Token JWT armazenado em localStorage

### Fluxo de Board
1. Crie um novo card com título, descrição, prioridade e prazo
2. Arraste entre colunas
3. Clique no card para ver detalhes
4. Edite ou delete o card

### Fluxo de Métricas
1. Crie vários cards com prazos variados
2. Mova alguns para "Concluído"
3. Acesse o dashboard de métricas
4. Visualize os gráficos e produtividade

---

## 📝 Variáveis de Ambiente

### Backend (`.env`)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-jwt-super-seguro"
JWT_EXPIRES_IN="7d"
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## 🎨 Design & UX

* **Cores**: Azul primário (#3B82F6), com acentos em vermelho/amarelo
* **Typography**: Inter/System fonts, tamanhos responsivos
* **Animações**: Transições suaves com Framer Motion
* **Responsivo**: Mobile-first com Tailwind CSS
* **Acessibilidade**: Labels, ARIA attributes, keyboard navigation

---

## 🔐 Segurança

* ✅ Senhas hasheadas com bcrypt
* ✅ JWT com expiração de 7 dias
* ✅ Validação de entrada com Zod
* ✅ Middleware de autenticação nas rotas
* ✅ CORS configurado
* ✅ Sanitização de dados

---

## 🚀 Próximas Melhorias

* 🔲 Filtros por data (próximos dias, atrasados, etc)
* 🔲 Busca por título/descrição
* 🔲 Exportar dados (CSV, PDF)
* 🔲 Dark mode
* 🔲 Notificações (email, browser)
* 🔲 Arquivos/anexos nos cards
* 🔲 Comentários nos cards
* 🔲 Labels/tags customizáveis
* 🔲 Integração com calendário
* 🔲 Deploy (Vercel + Railway)
* 🔲 Backup automático
* 🔲 Relatórios avançados

---

## 🌟 Diferenciais

* Full Stack profissional com padrões de produção
* Persistência real com SQLite e migrations
* Autenticação segura com JWT
* Métricas e analytics avançadas
* Animations smooth com Framer Motion
* Código organizado, type-safe e escalável
* UI/UX moderna e responsiva
* Histórico completo de mudanças

---

## 👨‍💻 Autor

Desenvolvido como projeto Full Stack profissional, demonstrando expertise em:
- Arquitetura de software moderna
- Boas práticas de desenvolvimento
- TypeScript avançado
- Autenticação e segurança
- UI/UX com Tailwind CSS
- Analytics e data visualization
- State management
- Database design

---

## 📄 Licença

MIT License - Fique livre para usar em seus projetos!
