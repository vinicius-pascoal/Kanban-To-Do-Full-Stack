# 📌 Kanban To-Do Full Stack

Um sistema **Kanban completo** para gerenciamento de tarefas, unindo **Kanban To-Do**, **controle por datas** e **métricas de produtividade**, desenvolvido como **projeto Full Stack** com **Next.js** e **SQLite**.

Projeto ideal para portfólio, demonstrando arquitetura, regras de negócio, persistência real de dados e visualização de informações.

## ✅ Status do Projeto

**Projeto Completo e Pronto para Uso!** ✨

A estrutura completa do projeto foi criada com separação entre frontend e backend:
- ✅ Backend com API REST, Prisma ORM e SQLite
- ✅ Frontend com Next.js, TypeScript e Tailwind CSS
- ✅ Componentes Kanban completos (Board, Column, Card)
- ✅ Dashboard de métricas e produtividade
- ✅ Sistema de criação/edição/exclusão de cards

---

## 🎯 Objetivo

Criar uma aplicação Kanban funcional e bem estruturada que permita:

* Organizar tarefas em colunas
* Controlar prazos e atrasos
* Visualizar métricas reais de produtividade
* Persistir dados em banco relacional leve (SQLite)

---

## 🚀 Funcionalidades

### ✅ Kanban To-Do

* Colunas fixas:

  * A Fazer
  * Em Progresso
  * Concluído
* Criar, editar e remover cards
* Drag & drop entre colunas
* Reordenação de cards

---

### 📅 Kanban com Datas

Cada card possui:

* Data de criação
* Prazo (due date)

**Regras visuais**

* 🔴 Atrasado
* 🟡 Vence hoje
* 🟢 Dentro do prazo

**Filtros**

* Cards atrasados
* Cards que vencem hoje
* Próximos dias

---

### 📊 Kanban + Dados (Métricas)

Dashboard com:

* Total de cards
* Cards por coluna
* Cards atrasados
* Tempo médio por coluna
* Cards concluídos por dia

Essas métricas ajudam a analisar produtividade e fluxo de trabalho.

---

## 🧠 Regras de Negócio

* Um card pertence a apenas uma coluna
* Ao mover um card:

  * Atualiza data de modificação
  * Registra histórico da movimentação
* Cards concluídos não entram em atraso
* Datas tratadas no backend em UTC

---

## 🛠️ Stack Utilizada

### Frontend

* **Next.js (App Router)**
* **TypeScript**
* **Tailwind CSS**
* **Framer Motion** (drag & drop e animações)
* **Zustand ou Context API** (estado global)

### Backend

* **API Routes (Next.js)**
* **Prisma ORM**
* **SQLite**
* **Zod** (validação de dados)

---

## 🗃️ Modelagem do Banco (Prisma)

```prisma
model Board {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  columns   Column[]
}

model Column {
  id        String   @id @default(cuid())
  name      String
  order     Int
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id])
  cards     Card[]
}

model Card {
  id          String   @id @default(cuid())
  title       String
  description String?
  priority    String
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  columnId    String
  column      Column  @relation(fields: [columnId], references: [id])
  history     CardHistory[]
}

model CardHistory {
  id       String   @id @default(cuid())
  cardId   String
  from     String
  to       String
  movedAt DateTime @default(now())
}
```

---

## 🔌 Endpoints Principais

```http
GET    /api/board
POST   /api/card
PUT    /api/card/:id
DELETE /api/card/:id
POST   /api/card/move
GET    /api/metrics
```

---

## 📁 Estrutura do Projeto

```
Kanban-To-Do-Full-Stack/
├── backend/                    # Backend da aplicação
│   ├── src/
│   │   ├── routes/            # Rotas da API (board, card, metrics)
│   │   ├── lib/               # Utilitários (prisma, validations, date-utils)
│   │   └── server.ts          # Servidor Express
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend da aplicação
│   ├── src/
│   │   ├── app/               # App Router (Next.js 14)
│   │   │   ├── dashboard/     # Página do dashboard
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/        # Componentes React
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CardModal.tsx
│   │   │   └── Metrics.tsx
│   │   └── lib/               # Utilitários (types, api, store, date-utils)
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── readme.md                   # Este arquivo
```

---

## ▶️ Como Executar o Projeto

### 1️⃣ Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar o banco de dados
npm run prisma:generate
npm run prisma:migrate

# Rodar o servidor
npm run dev
```

O backend estará disponível em `http://localhost:3001`

### 2️⃣ Frontend

```bash
# Em outro terminal, navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install

# Rodar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### 3️⃣ Acessar a Aplicação

Abra seu navegador e acesse `http://localhost:3000` para usar o sistema Kanban!

---

## 🌟 Diferenciais

* Projeto Full Stack real
* Persistência com SQLite
* Drag & drop animado
* Métricas de produtividade
* Código organizado e escalável

---

## 🔮 Possíveis Evoluções

* Autenticação
* Multi-board
* Exportação CSV
* Dark / Light mode
* Deploy (Vercel)

---

## 👨‍💻 Autor

Projeto desenvolvido para fins de estudo e portfólio, focado em boas práticas de desenvolvimento web moderno.
