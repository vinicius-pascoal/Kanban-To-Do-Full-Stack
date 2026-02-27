import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import teamRoutes from './routes/team';
import boardRoutes from './routes/board';
import cardRoutes from './routes/card';
import columnRoutes from './routes/column';
import metricsRoutes from './routes/metrics';
import googleCalendarRoutes from './routes/google-calendar';
import commentRoutes from './routes/comment';
import tagRoutes from './routes/tag';
import { setupSwagger } from './lib/swagger';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL || '',
  /\.vercel\.app$/, // Permite todos os subdomínios da Vercel
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    // Verifica se a origin está na lista permitida
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      // Se for regex, testa
      return allowed.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middlewares
app.use(express.json());

// Swagger Documentation
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/column', columnRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/tag', tagRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
