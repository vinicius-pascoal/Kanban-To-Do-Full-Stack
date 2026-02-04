# 📚 Documentação Swagger - Kanban To-Do API

## 🚀 Visão Geral

O Swagger foi integrado ao backend do Kanban To-Do Full Stack para fornecer uma documentação interativa e completa da API REST.

## 📍 Acesso

Após iniciar o servidor backend, a documentação Swagger estará disponível em:

- **Interface Web**: http://localhost:3001/api-docs
- **JSON Spec**: http://localhost:3001/api-docs.json

## 🔑 Autenticação

A API usa autenticação JWT (JSON Web Token). Para testar endpoints protegidos no Swagger:

1. Primeiro, faça o registro ou login usando os endpoints:
   - `POST /api/auth/register` - Registrar novo usuário
   - `POST /api/auth/login` - Fazer login

2. Copie o token JWT retornado na resposta

3. Clique no botão "Authorize" (🔒) no topo da página do Swagger

4. Cole o token no campo de valor no formato:
   ```
   Bearer seu_token_aqui
   ```

5. Clique em "Authorize" e depois "Close"

Agora você pode testar todos os endpoints protegidos!

## 📋 Endpoints Disponíveis

### Auth (Autenticação)
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Team (Times)
- `GET /api/team` - Listar times do usuário 🔒
- `GET /api/team/:id` - Buscar time específico 🔒

### Board (Boards/Quadros)
- `GET /api/board` - Buscar board com colunas e cards 🔒

### Column (Colunas)
- `GET /api/column` - Buscar todas as colunas 🔒
- `POST /api/column` - Criar nova coluna 🔒

### Card (Cards/Tarefas)
- `POST /api/card` - Criar novo card 🔒
- `GET /api/card/:id` - Buscar card específico 🔒
- `PUT /api/card/:id` - Atualizar card 🔒
- `DELETE /api/card/:id` - Deletar card 🔒

### Metrics (Métricas)
- `GET /api/metrics` - Buscar métricas do board 🔒

🔒 = Requer autenticação JWT

## 🏗️ Schemas (Modelos de Dados)

O Swagger documenta automaticamente os seguintes schemas:

- **User** - Informações do usuário
- **Team** - Informações do time
- **TeamMember** - Membro de um time
- **Board** - Quadro Kanban
- **Column** - Coluna do quadro
- **Card** - Card/tarefa

## 🛠️ Testando a API

### Exemplo: Criar um novo card

1. Autentique-se usando o botão "Authorize"
2. Navegue até `POST /api/card`
3. Clique em "Try it out"
4. Preencha o body do request:
```json
{
  "title": "Minha nova tarefa",
  "description": "Descrição detalhada da tarefa",
  "columnId": "uuid-da-coluna",
  "priority": "HIGH",
  "dueDate": "2026-02-10T15:00:00.000Z",
  "assignedToId": "uuid-do-usuario"
}
```
5. Clique em "Execute"
6. Veja a resposta abaixo

## 📦 Dependências Instaladas

- `swagger-ui-express` - Interface web do Swagger
- `swagger-jsdoc` - Geração automática da documentação a partir de comentários JSDoc
- `@types/swagger-ui-express` - Types do TypeScript
- `@types/swagger-jsdoc` - Types do TypeScript

## 🔧 Configuração

A configuração do Swagger está em [`src/lib/swagger.ts`](./src/lib/swagger.ts) e inclui:

- Definições OpenAPI 3.0
- Schemas de todos os modelos
- Configuração de segurança JWT
- URLs dos servidores (desenvolvimento e produção)

## 📝 Adicionando Documentação às Rotas

Para documentar novas rotas, adicione comentários JSDoc acima das rotas:

```typescript
/**
 * @swagger
 * /api/exemplo:
 *   get:
 *     summary: Descrição do endpoint
 *     tags: [NomeTag]
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NomeSchema'
 */
router.get('/exemplo', async (req, res) => {
  // código
});
```

## 🌐 Produção

Em produção, o Swagger estará disponível em:
- `https://seu-dominio.com/api-docs`

O servidor de produção é configurado automaticamente através da variável de ambiente `BACKEND_URL`.

## 💡 Dicas

- Use o Swagger para testar a API sem precisar do frontend
- Exporte a especificação JSON para ferramentas como Postman
- A documentação é gerada automaticamente a partir do código
- Mantenha os comentários JSDoc atualizados ao modificar rotas

## 🐛 Troubleshooting

### Swagger não aparece
- Verifique se o servidor está rodando
- Acesse http://localhost:3001/health para verificar se a API está funcionando
- Verifique o console do backend para mensagens de erro

### Endpoints não aparecem na documentação
- Verifique se os comentários JSDoc estão no formato correto
- Certifique-se de que o caminho do arquivo está incluído em `swagger.ts` (opção `apis`)

### Autenticação não funciona
- Certifique-se de incluir "Bearer " antes do token
- Verifique se o token não expirou
- Faça login novamente para obter um novo token

---

Desenvolvido com ❤️ para facilitar o desenvolvimento e testes da API Kanban To-Do
