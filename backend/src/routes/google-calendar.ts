import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../lib/auth-middleware';
import { createOAuthState, getOAuth2Client, verifyOAuthState, encryptToken } from '../lib/google-calendar';
import prisma from '../lib/prisma';
import {
  createWatchChannel,
  getCalendarStatus,
  markIntegrationDisconnected,
  renewExpiringWatches,
  stopWatchChannel,
  syncAssignedCardsToCalendar,
  syncCalendarChanges,
  upsertIntegration,
} from '../services/google-calendar-service';

const router = Router();
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

router.get('/connect-url', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const oauth2Client = getOAuth2Client();
    const state = createOAuthState(userId);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [CALENDAR_SCOPE],
      state,
    });

    res.json({ url: authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de conexão:', error);
    res.status(500).json({ error: 'Erro ao iniciar conexão com Google Calendar' });
  }
});

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      return res.status(400).send('Parâmetros inválidos');
    }

    const userId = verifyOAuthState(state);
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      const refreshTokenEncrypted = encryptToken(tokens.refresh_token);
      await upsertIntegration({
        userId,
        refreshTokenEncrypted,
        scope: tokens.scope || CALENDAR_SCOPE,
      });
    } else {
      const status = await getCalendarStatus(userId);
      if (!status.connected) {
        return res.status(400).send('Refresh token não retornado. Tente reconectar com prompt=consent.');
      }
    }

    await syncCalendarChanges(userId, true);
    await createWatchChannel(userId);
    syncAssignedCardsToCalendar(userId).catch((error) => {
      console.error('Erro ao sincronizar cards atribuídos com o calendário:', error);
    });

    const redirectUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/teams?calendar=connected`
      : '/';

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    res.status(500).send('Erro ao conectar Google Calendar');
  }
});

router.get('/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const status = await getCalendarStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Erro ao buscar status do Google Calendar:', error);
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

router.post('/sync', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const result = await syncCalendarChanges(userId);
    res.json({ synced: result.synced });
  } catch (error) {
    console.error('Erro ao sincronizar Google Calendar:', error);
    res.status(500).json({ error: 'Erro ao sincronizar' });
  }
});

router.post('/disconnect', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    await stopWatchChannel(userId);
    await markIntegrationDisconnected(userId);
    res.json({ disconnected: true });
  } catch (error) {
    console.error('Erro ao desconectar Google Calendar:', error);
    res.status(500).json({ error: 'Erro ao desconectar' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const channelId = req.header('x-goog-channel-id');
  if (!channelId) {
    return res.status(200).send('ok');
  }

  try {
    const integration = await prisma.googleCalendarIntegration.findFirst({
      where: { syncState: { channelId } },
      include: { syncState: true },
    });

    if (!integration) {
      return res.status(200).send('ok');
    }

    await syncCalendarChanges(integration.userId);
  } catch (error) {
    console.error('Erro no webhook do Google Calendar:', error);
  }

  res.status(200).send('ok');
});

router.post('/renew-watches', async (req: Request, res: Response) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.header('x-cron-secret') !== secret) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const renewed = await renewExpiringWatches();
    res.json({ renewed });
  } catch (error) {
    console.error('Erro ao renovar watch channels:', error);
    res.status(500).json({ error: 'Erro ao renovar canais' });
  }
});

export default router;
