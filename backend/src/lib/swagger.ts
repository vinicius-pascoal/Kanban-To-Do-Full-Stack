import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanban To-Do API',
      version: '1.0.0',
      description: 'API completa para gerenciamento de boards Kanban, times e tarefas',
      contact: {
        name: 'API Support',
        email: 'support@kanban-todo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: process.env.BACKEND_URL || '',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtido através do endpoint de login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            members: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TeamMember',
              },
            },
          },
        },
        TeamMember: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            role: {
              type: 'string',
              enum: ['OWNER', 'ADMIN', 'MEMBER'],
            },
            joinedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Board: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            teamId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            columns: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Column',
              },
            },
          },
        },
        Column: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            position: {
              type: 'integer',
            },
            boardId: {
              type: 'string',
              format: 'uuid',
            },
            cards: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Card',
              },
            },
          },
        },
        Card: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            position: {
              type: 'integer',
            },
            columnId: {
              type: 'string',
              format: 'uuid',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              nullable: true,
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            assignedToId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Caminho para os arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kanban To-Do API Docs',
  }));

  // JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Documentação Swagger disponível em /api-docs');
};
