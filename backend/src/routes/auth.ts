import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { registerSchema, loginSchema, createTeamSchema } from '../lib/auth-validations';
import { OAuth2Client } from 'google-auth-library';
import { createOAuthState, getOAuth2Client } from '../lib/google-calendar';
import { authMiddleware, AuthenticatedRequest } from '../lib/auth-middleware';

const router = Router();

const createUserWithDefaultTeam = async (data: { email: string; name: string; password?: string | null; googleSub?: string | null }) => {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password || null,
      name: data.name,
      googleSub: data.googleSub || null,
      teams: {
        create: {
          team: {
            create: {
              name: `Time de ${data.name}`,
              boards: {
                create: {
                  name: 'Meu Kanban',
                  columns: {
                    create: [
                      { name: 'A Fazer', order: 0 },
                      { name: 'Em Progresso', order: 1 },
                      { name: 'Concluído', order: 2 },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    include: {
      teams: {
        include: {
          team: {
            include: {
              boards: true,
            },
          },
        },
      },
    },
  });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@exemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: senha123
 *               name:
 *                 type: string
 *                 example: João Silva
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token de autenticação
 *       400:
 *         description: Erro de validação ou usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/auth/register - Registrar novo usuário
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Criar usuário e seu time padrão
    const user = await createUserWithDefaultTeam({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    });

    const token = generateToken(user.id, user.email);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(400).json({ error: 'Erro ao registrar usuário' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@exemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token de autenticação
 *       401:
 *         description: Email ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/auth/login - Fazer login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(400).json({ error: 'Erro ao fazer login' });
  }
});

// POST /api/auth/google - Login/registro com Google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      return res.status(400).json({ error: 'idToken é obrigatório' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ error: 'Email não encontrado no token' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    let user = existingUser;
    let isNewUser = false;

    if (!user) {
      user = await createUserWithDefaultTeam({
        email: payload.email,
        name: payload.name || payload.email,
        googleSub: payload.sub,
      });
      isNewUser = true;
    } else if (!user.googleSub && payload.sub) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleSub: payload.sub },
      });
    }

    const token = generateToken(user.id, user.email);

    // Gerar URL de autorização do Google Calendar para novos usuários
    let calendarAuthUrl: string | null = null;
    if (isNewUser) {
      const oauth2Client = getOAuth2Client();
      const state = createOAuthState(user.id);
      calendarAuthUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        state,
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      calendarAuthUrl, // URL para conectar ao Google Calendar (apenas para novos usuários)
    });
  } catch (error) {
    console.error('Erro no login Google:', error);
    res.status(400).json({ error: 'Erro ao autenticar com Google' });
  }
});

// PUT /api/auth/profile - Atualizar perfil do usuário
router.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

    // Validar que pelo menos um campo foi fornecido
    if (!name && !email && !password) {
      return res.status(400).json({ error: 'Forneça pelo menos um campo para atualizar' });
    }

    // Atualizar dados do usuário
    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (email) {
      // Verificar se email já está em uso por outro usuário
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      updateData.email = email;
    }

    if (password) {
      // Hash da nova senha
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Se email foi alterado, gerar novo token
    const token = email ? generateToken(updatedUser.id, updatedUser.email) : undefined;

    res.json({
      user: updatedUser,
      token, // Retornar novo token apenas se email foi alterado
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(400).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;
