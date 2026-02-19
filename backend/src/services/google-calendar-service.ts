import prisma from '../lib/prisma';
import { decryptToken, getCalendarClient, getOAuth2Client } from '../lib/google-calendar';
import { GoogleCalendarStatus } from '@prisma/client';
import crypto from 'crypto';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const WATCH_TTL_SECONDS = 60 * 60 * 24 * 7;

const getCalendarIntegration = async (userId: string) => {
  return prisma.googleCalendarIntegration.findFirst({
    where: { userId, status: GoogleCalendarStatus.CONNECTED },
    include: { syncState: true },
  });
};

const buildCalendarEvent = (card: {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  column: { isCompleted?: boolean; boardId: string };
}) => {
  if (!card.dueDate) return null;
  const start = card.dueDate;
  const end = new Date(card.dueDate.getTime() + 60 * 60 * 1000);

  return {
    summary: card.title,
    description: card.description || undefined,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    extendedProperties: {
      private: {
        app: 'kanban',
        cardId: card.id,
        boardId: card.column.boardId,
      },
    },
  };
};

const getOAuthClientForIntegration = (refreshTokenEncrypted: string) => {
  const oauth2Client = getOAuth2Client();
  const refreshToken = decryptToken(refreshTokenEncrypted);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
};

export const upsertCardEvent = async (userId: string, cardId: string) => {
  const integration = await getCalendarIntegration(userId);
  if (!integration) return;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: true },
  });

  if (!card) return;

  if (!card.dueDate || card.column.isCompleted) {
    await deleteCardEvent(userId, cardId);
    return;
  }

  const eventPayload = buildCalendarEvent({
    id: card.id,
    title: card.title,
    description: card.description,
    dueDate: card.dueDate,
    column: { isCompleted: card.column.isCompleted, boardId: card.column.boardId },
  });

  if (!eventPayload) return;

  const oauth2Client = getOAuthClientForIntegration(integration.refreshTokenEncrypted);
  const calendar = getCalendarClient(oauth2Client);

  const existingLink = await prisma.calendarEventLink.findUnique({
    where: { userId_cardId: { userId, cardId } },
  });

  if (existingLink) {
    const updatedEvent = await calendar.events.patch({
      calendarId: integration.calendarId,
      eventId: existingLink.eventId,
      requestBody: eventPayload,
    });

    await prisma.calendarEventLink.update({
      where: { userId_cardId: { userId, cardId } },
      data: {
        calendarId: integration.calendarId,
        eventId: updatedEvent.data.id || existingLink.eventId,
        etag: updatedEvent.data.etag || existingLink.etag || undefined,
        boardId: card.column.boardId,
      },
    });
    return;
  }

  const createdEvent = await calendar.events.insert({
    calendarId: integration.calendarId,
    requestBody: eventPayload,
  });

  if (!createdEvent.data.id) return;

  await prisma.calendarEventLink.create({
    data: {
      userId,
      cardId,
      boardId: card.column.boardId,
      calendarId: integration.calendarId,
      eventId: createdEvent.data.id,
      etag: createdEvent.data.etag || null,
    },
  });
};

export const deleteCardEvent = async (userId: string, cardId: string) => {
  const integration = await getCalendarIntegration(userId);
  if (!integration) return;

  const existingLink = await prisma.calendarEventLink.findUnique({
    where: { userId_cardId: { userId, cardId } },
  });

  if (!existingLink) return;

  const oauth2Client = getOAuthClientForIntegration(integration.refreshTokenEncrypted);
  const calendar = getCalendarClient(oauth2Client);

  try {
    await calendar.events.delete({
      calendarId: existingLink.calendarId,
      eventId: existingLink.eventId,
    });
  } catch (error) {
    // Ignore not found errors
  }

  await prisma.calendarEventLink.delete({
    where: { userId_cardId: { userId, cardId } },
  });
};

const parseEventStart = (event: { start?: { dateTime?: string | null; date?: string | null } }) => {
  if (event.start?.dateTime) return new Date(event.start.dateTime);
  if (event.start?.date) return new Date(`${event.start.date}T00:00:00.000Z`);
  return null;
};

export const syncCalendarChanges = async (userId: string, forceFullSync = false): Promise<{ synced: number; nextSyncToken: string | null }> => {
  const integration = await getCalendarIntegration(userId);
  if (!integration) return { synced: 0, nextSyncToken: null };

  const oauth2Client = getOAuthClientForIntegration(integration.refreshTokenEncrypted);
  const calendar = getCalendarClient(oauth2Client);

  const syncState = integration.syncState;
  const hasSyncToken = syncState?.syncToken && !forceFullSync;

  const listParams: any = {
    calendarId: integration.calendarId,
    singleEvents: true,
    showDeleted: true,
    maxResults: 2500,
  };

  if (hasSyncToken) {
    listParams.syncToken = syncState?.syncToken;
  }

  let eventsResponse;
  try {
    eventsResponse = await calendar.events.list(listParams);
  } catch (error: any) {
    if (error?.code === 410 && hasSyncToken) {
      return syncCalendarChanges(userId, true);
    }
    throw error;
  }

  const events = eventsResponse.data.items || [];
  let processed = 0;

  for (const event of events) {
    const privateProps = event.extendedProperties?.private || {};
    if (privateProps.app !== 'kanban' || !privateProps.cardId) continue;

    const cardId = privateProps.cardId as string;
    const linkData = {
      userId,
      cardId,
      calendarId: integration.calendarId,
      eventId: event.id || '',
      etag: event.etag || null,
    };

    if (event.status === 'cancelled') {
      await prisma.card.update({
        where: { id: cardId },
        data: { dueDate: null },
      }).catch(() => undefined);

      await prisma.calendarEventLink.delete({
        where: { userId_cardId: { userId, cardId } },
      }).catch(() => undefined);

      processed += 1;
      continue;
    }

    const dueDate = parseEventStart(event);
    if (!dueDate) continue;

    await prisma.card.update({
      where: { id: cardId },
      data: {
        title: event.summary || undefined,
        description: event.description || undefined,
        dueDate,
      },
    }).catch(() => undefined);

    if (event.id) {
      await prisma.calendarEventLink.upsert({
        where: { userId_cardId: { userId, cardId } },
        create: { ...linkData, eventId: event.id },
        update: { ...linkData, eventId: event.id },
      });
    }

    processed += 1;
  }

  const nextSyncToken = eventsResponse.data.nextSyncToken || null;
  if (nextSyncToken) {
    await prisma.calendarSyncState.upsert({
      where: { integrationId: integration.id },
      create: {
        integrationId: integration.id,
        syncToken: nextSyncToken,
      },
      update: {
        syncToken: nextSyncToken,
      },
    });
  }

  return { synced: processed, nextSyncToken };
};

export const createWatchChannel = async (userId: string) => {
  const integration = await getCalendarIntegration(userId);
  if (!integration) return null;

  const webhookUrl = process.env.GOOGLE_CALENDAR_WEBHOOK_URL;
  if (!webhookUrl) return null;

  const oauth2Client = getOAuthClientForIntegration(integration.refreshTokenEncrypted);
  const calendar = getCalendarClient(oauth2Client);

  const channelId = `kanban-${userId}-${crypto.randomUUID()}`;
  const response = await calendar.events.watch({
    calendarId: integration.calendarId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      params: {
        ttl: `${WATCH_TTL_SECONDS}`,
      },
    },
  });

  const expiration = response.data.expiration ? new Date(Number(response.data.expiration)) : null;

  await prisma.calendarSyncState.upsert({
    where: { integrationId: integration.id },
    create: {
      integrationId: integration.id,
      channelId,
      resourceId: response.data.resourceId || null,
      channelExpiration: expiration,
    },
    update: {
      channelId,
      resourceId: response.data.resourceId || null,
      channelExpiration: expiration,
    },
  });

  return { channelId, resourceId: response.data.resourceId, expiration };
};

export const stopWatchChannel = async (userId: string) => {
  const integration = await getCalendarIntegration(userId);
  if (!integration?.syncState?.channelId || !integration.syncState.resourceId) return;

  const oauth2Client = getOAuthClientForIntegration(integration.refreshTokenEncrypted);
  const calendar = getCalendarClient(oauth2Client);

  await calendar.channels.stop({
    requestBody: {
      id: integration.syncState.channelId,
      resourceId: integration.syncState.resourceId,
    },
  }).catch(() => undefined);

  await prisma.calendarSyncState.update({
    where: { integrationId: integration.id },
    data: {
      channelId: null,
      resourceId: null,
      channelExpiration: null,
    },
  });
};

export const renewExpiringWatches = async () => {
  const threshold = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiring = await prisma.calendarSyncState.findMany({
    where: {
      channelExpiration: { lte: threshold },
      integration: { status: GoogleCalendarStatus.CONNECTED },
    },
    include: { integration: true },
  });

  for (const state of expiring) {
    await stopWatchChannel(state.integration.userId);
    await createWatchChannel(state.integration.userId);
  }

  return expiring.length;
};

export const getCalendarStatus = async (userId: string) => {
  const integration = await prisma.googleCalendarIntegration.findFirst({
    where: { userId },
    include: { syncState: true },
  });

  return {
    connected: integration?.status === GoogleCalendarStatus.CONNECTED,
    calendarId: integration?.calendarId || null,
    scope: integration?.scope || null,
    updatedAt: integration?.updatedAt || null,
    channelExpiration: integration?.syncState?.channelExpiration || null,
  };
};

export const syncAssignedCardsToCalendar = async (userId: string) => {
  const cards = await prisma.card.findMany({
    where: {
      assignedToId: userId,
      dueDate: { not: null },
      column: { isCompleted: false },
    },
    select: { id: true },
  });

  for (const card of cards) {
    await upsertCardEvent(userId, card.id).catch((error) => {
      console.error(`Erro ao sincronizar card ${card.id} com calendário:`, error);
    });
  }
};

export const markIntegrationDisconnected = async (userId: string) => {
  const integration = await prisma.googleCalendarIntegration.findFirst({
    where: { userId },
  });

  if (!integration) return;

  await prisma.googleCalendarIntegration.update({
    where: { id: integration.id },
    data: { status: GoogleCalendarStatus.DISCONNECTED },
  });
};

export const upsertIntegration = async (data: {
  userId: string;
  googleSub?: string | null;
  refreshTokenEncrypted: string;
  scope?: string | null;
}) => {
  const existing = await prisma.googleCalendarIntegration.findFirst({
    where: { userId: data.userId },
  });

  if (existing) {
    return prisma.googleCalendarIntegration.update({
      where: { id: existing.id },
      data: {
        googleSub: data.googleSub || existing.googleSub,
        refreshTokenEncrypted: data.refreshTokenEncrypted || existing.refreshTokenEncrypted,
        scope: data.scope || existing.scope,
        status: GoogleCalendarStatus.CONNECTED,
      },
    });
  }

  return prisma.googleCalendarIntegration.create({
    data: {
      userId: data.userId,
      googleSub: data.googleSub || null,
      refreshTokenEncrypted: data.refreshTokenEncrypted,
      scope: data.scope || CALENDAR_SCOPE,
      status: GoogleCalendarStatus.CONNECTED,
    },
  });
};
