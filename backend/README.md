# Backend - Kanban To-Do

API REST para o sistema Kanban desenvolvida com Express, TypeScript, Prisma e SQLite.

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## 📁 Estrutura de Rotas

### Board
- `GET /api/board` - Buscar board com colunas e cards
- `POST /api/board` - Criar novo board

### Cards
- `POST /api/card` - Criar novo card
- `GET /api/card/:id` - Buscar card específico
- `PUT /api/card/:id` - Atualizar card
- `DELETE /api/card/:id` - Deletar card
- `POST /api/card/move` - Mover card entre colunas

### Métricas
- `GET /api/metrics` - Buscar métricas do board

## 🗄️ Banco de Dados

O projeto usa SQLite com Prisma ORM. O arquivo do banco (`dev.db`) é criado automaticamente após rodar as migrations.

Para visualizar os dados:
```bash
npm run prisma:studio
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Roda o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Roda o servidor compilado
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Roda as migrations
- `npm run prisma:studio` - Abre o Prisma Studio
