import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { registerSchema, loginSchema, createTeamSchema } from '../lib/auth-validations';

const router = Router();

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
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        teams: {
          create: {
            team: {
              create: {
                name: `Time de ${validatedData.name}`,
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

export default router;
