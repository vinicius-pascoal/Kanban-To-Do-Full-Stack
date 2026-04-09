# Planify — Kanban To-Do Full Stack

<p align="center">
  <img src="./frontend/public/imgs/logo-texto.png" alt="Planify Logo" width="220"/>
</p>

<p align="center">
  Um sistema <strong>Kanban completo</strong> para gerenciamento de tarefas em equipe — com board visual, Google Calendar, comentários, tags, métricas avançadas e autenticação OAuth.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js"/>
  <img src="https://img.shields.io/badge/Express.js-4-green?style=flat-square&logo=express"/>
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma"/>
  <img src="https://img.shields.io/badge/PostgreSQL-blue?style=flat-square&logo=postgresql"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat-square&logo=tailwind-css"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square"/>
</p>

## <img src="https://api.iconify.design/mdi:book-open-page-variant-outline.svg?color=%232563eb" alt="" width="18"/> Sumário

- [<img src="https://api.iconify.design/mdi:image-outline.svg?color=%232563eb" alt="" width="14"/> Screenshots](#screenshots)
- [<img src="https://api.iconify.design/mdi:check-decagram-outline.svg?color=%2316a34a" alt="" width="14"/> Status do Projeto](#status-do-projeto)
- [<img src="https://api.iconify.design/mdi:target.svg?color=%23dc2626" alt="" width="14"/> Objetivo](#objetivo)
- [<img src="https://api.iconify.design/mdi:rocket-launch-outline.svg?color=%23ea580c" alt="" width="14"/> Funcionalidades](#funcionalidades)
- [<img src="https://api.iconify.design/mdi:tools.svg?color=%237c3aed" alt="" width="14"/> Stack](#stack)
- [<img src="https://api.iconify.design/mdi:database-outline.svg?color=%237c3aed" alt="" width="14"/> Schema do Banco de Dados](#schema-do-banco-de-dados)
- [<img src="https://api.iconify.design/mdi:api.svg?color=%237c3aed" alt="" width="14"/> Endpoints da API](#endpoints-da-api)
- [<img src="https://api.iconify.design/mdi:folder-multiple-outline.svg?color=%237c3aed" alt="" width="14"/> Estrutura do Projeto](#estrutura-do-projeto)
- [<img src="https://api.iconify.design/mdi:play-circle-outline.svg?color=%237c3aed" alt="" width="14"/> Como Executar Localmente](#como-executar-localmente)
- [<img src="https://api.iconify.design/mdi:shield-check-outline.svg?color=%237c3aed" alt="" width="14"/> Segurança](#seguranca)
- [<img src="https://api.iconify.design/mdi:cloud-upload-outline.svg?color=%237c3aed" alt="" width="14"/> Deploy](#deploy)
- [<img src="https://api.iconify.design/mdi:file-document-outline.svg?color=%237c3aed" alt="" width="14"/> Documentação da API](#documentacao-da-api)
- [<img src="https://api.iconify.design/mdi:account-tie-outline.svg?color=%237c3aed" alt="" width="14"/> Autor](#autor)
- [<img src="https://api.iconify.design/mdi:license.svg?color=%237c3aed" alt="" width="14"/> Licença](#licenca)

---

<a id="screenshots"></a>
## <img src="https://api.iconify.design/mdi:image-outline.svg?color=%232563eb" alt="" width="18"/> Screenshots

### Home
![Home Page](./demohome.png)

### Kanban Board
![Kanban Board](./demoBoard.png)

---

<a id="status-do-projeto"></a>
## <img src="https://api.iconify.design/mdi:check-decagram-outline.svg?color=%2316a34a" alt="" width="18"/> Status do Projeto

**Projeto Completo e Funcional!** ✨

| Módulo | Status |
|--------|--------|
| API REST com Express + Prisma | ✅ |
| Autenticação JWT + Google OAuth | ✅ |
| Board Kanban com drag & drop | ✅ |
| Comentários em cards | ✅ |
| Tags / Labels personalizáveis | ✅ |
| Integração com Google Calendar | ✅ |
| Dashboard de métricas (Recharts) | ✅ |
| Exportação de relatório em PDF | ✅ |
| Permissões granulares por membro | ✅ |
| Documentação Swagger | ✅ |
| Deploy Vercel (frontend + backend) | ✅ |

---

<a id="objetivo"></a>
## <img src="https://api.iconify.design/mdi:target.svg?color=%23dc2626" alt="" width="18"/> Objetivo

Criar uma aplicação Kanban profissional que permita:

- Organizar tarefas em colunas customizáveis com cores
- Controlar prazos com alertas visuais de urgência
- Atribuir tarefas a membros do time
- Comentar e colaborar diretamente nos cards
- Classificar tasks com tags coloridas
- Sincronizar prazos com o Google Calendar
- Visualizar métricas reais de produtividade
- Gerenciar múltiplos times com permissões personalizadas

---

<a id="funcionalidades"></a>
## <img src="https://api.iconify.design/mdi:rocket-launch-outline.svg?color=%23ea580c" alt="" width="18"/> Funcionalidades

### <img src="https://api.iconify.design/mdi:shield-lock-outline.svg?color=%230ea5e9" alt="" width="16"/> Autenticação
- Registro e login com e-mail + senha (JWT)
- Login social com **Google OAuth** (NextAuth + `@react-oauth/google`)
- Tokens seguros com expiração de 7 dias
- Proteção de rotas com middleware e `next/middleware`
- Recuperação de sessão automática

### <img src="https://api.iconify.design/mdi:account-group-outline.svg?color=%230ea5e9" alt="" width="16"/> Gerenciamento de Times
- Criar e renomear times
- Adicionar e remover membros
- Sistema de **permissões granulares** por membro:
  - Criar / editar / remover cards
  - Criar / editar / remover colunas
  - Adicionar / remover membros
  - Visualizar métricas
  - Gerenciar tags

### <img src="https://api.iconify.design/mdi:view-kanban-outline.svg?color=%230ea5e9" alt="" width="16"/> Kanban Board
- Colunas customizáveis com **nome e cor**
- Marcar coluna como **"Concluída"** (conclusão automática de cards)
- **Drag & drop** animado entre colunas (Framer Motion)
- Reordenação de cards dentro da coluna
- Histórico completo de movimentações por card

### <img src="https://api.iconify.design/mdi:tag-multiple-outline.svg?color=%230ea5e9" alt="" width="16"/> Tags & Labels
- Criar tags com nome e cor personalizada por board
- Associar múltiplas tags a um card
- Gerenciar tags de forma centralizada (TagsManager)
- Permissão específica para gerenciar tags (`canManageTags`)

### <img src="https://api.iconify.design/mdi:comment-text-outline.svg?color=%230ea5e9" alt="" width="16"/> Comentários
- Adicionar comentários diretamente no card
- Autoria e timestamp por comentário
- Listagem em ordem cronológica no modal de detalhes

### <img src="https://api.iconify.design/mdi:calendar-sync-outline.svg?color=%230ea5e9" alt="" width="16"/> Integração Google Calendar
- Conectar conta Google via OAuth
- Sincronizar cards com data de vencimento como eventos no Google Calendar
- Setup guiado em `/calendar-setup`
- Gerir integração nas configurações do time

### <img src="https://api.iconify.design/mdi:chart-box-outline.svg?color=%230ea5e9" alt="" width="16"/> Dashboard de Métricas
KPIs em tempo real:
- Total de cards / taxa de conclusão / cards atrasados / vencendo hoje

Gráficos interativos (Recharts):
- 🥧 **Pie** — Distribuição por coluna
- 📊 **Bar** — Conclusões por dia
- 📈 **Line** — Tempo médio por coluna
- 📋 **Composed** — Status dos cards (stacked)

Produtividade por membro:
- Cards criados, concluídos e em progresso
- Tempo médio de conclusão
- Tabela com ranking

Exportar relatório completo em **PDF** (jsPDF + AutoTable)

### <img src="https://api.iconify.design/mdi:palette-outline.svg?color=%230ea5e9" alt="" width="16"/> Visual & UX
- Tema claro / escuro (ThemeToggle)
- Animações com Framer Motion
- Indicadores visuais de prazo no card:
  - 🔴 Atrasado | 🟡 Vence hoje | 🟢 No prazo | ✅ Concluído
- Prioridade por badge colorido: Baixa / Média / Alta
- Toast de feedback em todas as ações
- Totalmente responsivo (mobile-first)

---

<a id="stack"></a>
## <img src="https://api.iconify.design/mdi:tools.svg?color=%237c3aed" alt="" width="18"/> Stack

### Frontend
| Tech | Versão | Uso |
|------|--------|-----|
| Next.js | 14 | Framework React (App Router) |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Estilização utility-first |
| Framer Motion | 11 | Animações e drag & drop |
| Recharts | 3 | Gráficos interativos |
| Zustand | 4 | State management |
| NextAuth | 4 | Autenticação social (Google) |
| @react-oauth/google | 0.12 | Login com Google |
| jsPDF + AutoTable | — | Exportação PDF |
| Lucide React | — | Ícones |
| Zod | 3 | Validação client-side |
| date-fns | 3 | Manipulação de datas |

### Backend
| Tech | Versão | Uso |
|------|--------|-----|
| Express.js | 4 | Servidor HTTP / API REST |
| TypeScript | 5 | Type safety |
| Prisma ORM | 5 | Acesso ao banco de dados |
| PostgreSQL | — | Banco de dados relacional |
| JWT (jsonwebtoken) | 9 | Autenticação |
| bcryptjs | — | Hash de senhas |
| Google Auth Library | 9 | Verificação Google OAuth |
| googleapis | 131 | API Google Calendar |
| Zod | 3 | Validação server-side |
| Swagger (jsdoc + ui) | — | Documentação da API |

---

<a id="schema-do-banco-de-dados"></a>
## <img src="https://api.iconify.design/mdi:database-outline.svg?color=%237c3aed" alt="" width="18"/> Schema do Banco de Dados

```
User                 — Dados de usuário e credenciais Google
Team                 — Times / Projetos
TeamMember           — Relação usuário-time + permissões granulares
Board                — Quadro Kanban (vinculado ao time)
Column               — Colunas do board (com cor e flag isCompleted)
Card                 — Tarefas com prioridade, prazo, atribuição
Comment              — Comentários em cards
Tag                  — Labels coloridas por board
CardHistory          — Histórico de movimentações dos cards
GoogleCalendarIntegration — Tokens OAuth Google por usuário
CalendarEventLink    — Vínculo card ↔ evento do Google Calendar
CalendarSyncState    — Estado de sincronização
```

---

<a id="endpoints-da-api"></a>
## <img src="https://api.iconify.design/mdi:api.svg?color=%237c3aed" alt="" width="18"/> Endpoints da API

Documentação interativa Swagger disponível em:
```
http://localhost:3001/api-docs
```

### Autenticação
```http
POST   /api/auth/register          # Registrar novo usuário
POST   /api/auth/login             # Login (e-mail + senha)
POST   /api/auth/google            # Login com Google OAuth
```

### Board
```http
GET    /api/board                  # Board com colunas, cards e tags
POST   /api/board                  # Criar board
```

### Cards
```http
POST   /api/card                   # Criar card
GET    /api/card/:id               # Detalhes do card
PUT    /api/card/:id               # Editar card
DELETE /api/card/:id               # Deletar card
POST   /api/card/move              # Mover card entre colunas
```

### Colunas
```http
POST   /api/column                 # Criar coluna
PUT    /api/column/:id             # Editar coluna
DELETE /api/column/:id             # Deletar coluna
```

### Comentários
```http
POST   /api/comment                # Adicionar comentário
DELETE /api/comment/:id            # Remover comentário
```

### Tags
```http
GET    /api/tag                    # Listar tags do board
POST   /api/tag                    # Criar tag
PUT    /api/tag/:id                # Editar tag
DELETE /api/tag/:id                # Deletar tag
POST   /api/tag/:id/card/:cardId   # Associar tag a card
DELETE /api/tag/:id/card/:cardId   # Desassociar tag de card
```

### Métricas
```http
GET    /api/metrics                # KPIs, gráficos e produtividade por membro
```

### Times
```http
POST   /api/team                   # Criar time
GET    /api/team/:id               # Time com membros e permissões
POST   /api/team/:id/member        # Adicionar membro
DELETE /api/team/:id/member        # Remover membro
PUT    /api/team/:id/member/:uid   # Atualizar permissões do membro
```

### Google Calendar
```http
GET    /api/google-calendar/auth-url        # URL de autorização OAuth
POST   /api/google-calendar/callback        # Trocar código por tokens
GET    /api/google-calendar/status          # Status da integração
POST   /api/google-calendar/sync/:cardId    # Sincronizar card como evento
DELETE /api/google-calendar/disconnect      # Desconectar integração
```

---

<a id="estrutura-do-projeto"></a>
## <img src="https://api.iconify.design/mdi:folder-multiple-outline.svg?color=%237c3aed" alt="" width="18"/> Estrutura do Projeto

```
Kanban-To-Do-Full-Stack/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Entry point
│   │   ├── server.ts                 # Configuração Express
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── board.ts
│   │   │   ├── card.ts
│   │   │   ├── column.ts
│   │   │   ├── comment.ts
│   │   │   ├── tag.ts
│   │   │   ├── metrics.ts
│   │   │   ├── team.ts
│   │   │   └── google-calendar.ts
│   │   ├── services/
│   │   │   └── google-calendar-service.ts
│   │   └── lib/
│   │       ├── auth-middleware.ts
│   │       ├── auth-validations.ts
│   │       ├── date-utils.ts
│   │       ├── google-calendar.ts
│   │       ├── jwt.ts
│   │       ├── permissions.ts
│   │       ├── prisma.ts
│   │       ├── swagger.ts
│   │       └── validations.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── vercel.json
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── calendar-setup/page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── [teamId]/page.tsx
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [teamId]/settings/page.tsx
│   │   │   ├── api/auth/[...nextauth]/route.ts
│   │   │   ├── privacy-policy/page.tsx
│   │   │   └── terms-of-service/page.tsx
│   │   ├── components/
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CardModal.tsx
│   │   │   ├── CardDetailModal.tsx
│   │   │   ├── Metrics.tsx
│   │   │   ├── TagsManager.tsx
│   │   │   ├── GoogleCalendarSettings.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── Toast.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── api-client.ts
│   │   │   ├── auth-provider.tsx
│   │   │   ├── auth-store.ts
│   │   │   ├── session-provider.tsx
│   │   │   ├── store.ts
│   │   │   ├── date-utils.ts
│   │   │   └── types.ts
│   │   └── middleware.ts
│   ├── public/imgs/
│   ├── vercel.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── demohome.png
├── demoBoard.png
├── package.json                      # Scripts raiz (concurrently)
├── prepare-deploy.sh
├── prepare-deploy.ps1
└── readme.md
```

---

<a id="como-executar-localmente"></a>
## <img src="https://api.iconify.design/mdi:play-circle-outline.svg?color=%237c3aed" alt="" width="18"/> Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente (ou string de conexão remota)
- Conta Google Cloud com OAuth 2.0 configurado (para Calendar)

### 1. Clonar o repositório
```bash
git clone https://github.com/vinicius-pascoal/Kanban-To-Do-Full-Stack.git
cd Kanban-To-Do-Full-Stack
```

### 2. Instalar dependências
```bash
npm run install-all
```

### 3. Configurar variáveis de ambiente

**`backend/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kanban"
JWT_SECRET="seu-secret-jwt-super-seguro"
JWT_EXPIRES_IN="7d"

# Google Calendar OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
CALENDAR_ENCRYPTION_KEY="chave-de-32-caracteres"
FRONTEND_URL="http://localhost:3000"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-nextauth-secret"

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 4. Executar migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 5. Rodar o projeto (modo desenvolvimento)
```bash
# Backend → http://localhost:3001
cd backend && npm run dev

# Frontend → http://localhost:3000
cd frontend && npm run dev
```

### 6. Primeiros passos na aplicação
1. Acesse `http://localhost:3000`
2. Registre uma conta ou entre com Google
3. Crie um time e adicione membros
4. Crie colunas e comece a adicionar cards
5. Configure o Google Calendar em `/calendar-setup`
6. Acesse as métricas pelo dashboard

---

<a id="seguranca"></a>
## <img src="https://api.iconify.design/mdi:shield-check-outline.svg?color=%237c3aed" alt="" width="18"/> Segurança

- Senhas hasheadas com **bcrypt**
- Autenticação via **JWT** (7 dias) + **Google OAuth**
- Validação rigorosa de dados com **Zod** (server + client)
- **Middleware de permissões** verificado em cada rota protegida
- CORS configurado para origens permitidas
- Tokens Google armazenados criptografados no banco

---

<a id="deploy"></a>
## <img src="https://api.iconify.design/mdi:cloud-upload-outline.svg?color=%237c3aed" alt="" width="18"/> Deploy

O projeto possui suporte a deploy na **Vercel** com `vercel.json` configurado para ambos frontend e backend.

```bash
# Script de preparação para deploy
./prepare-deploy.sh   # Linux/macOS
./prepare-deploy.ps1  # Windows PowerShell
```

---

<a id="documentacao-da-api"></a>
## <img src="https://api.iconify.design/mdi:file-document-outline.svg?color=%237c3aed" alt="" width="18"/> Documentação da API

Swagger UI disponível após subir o backend:
```
http://localhost:3001/api-docs
```
JSON spec:
```
http://localhost:3001/api-docs.json
```

---

<a id="autor"></a>
## <img src="https://api.iconify.design/mdi:account-tie-outline.svg?color=%237c3aed" alt="" width="18"/> Autor

Desenvolvido por **Vinícius Pascoal** 

---

<a id="licenca"></a>
## <img src="https://api.iconify.design/mdi:license.svg?color=%237c3aed" alt="" width="18"/> Licença

[MIT](./LICENSE) — Fique livre para usar em seus projetos!
