import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Helper to get the backend token from the session
 */
export async function getBackendToken(): Promise<string | null> {
  const session = await getSession();
  return session?.backendToken || null;
}

/**
 * Helper to make authenticated API requests
 */
export async function fetchWithAuth(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const token = await getBackendToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Google Calendar API client
 */
export const googleCalendarApi = {
  /**
   * Get Google Calendar connection URL
   */
  async getConnectUrl(): Promise<{ url: string }> {
    const res = await fetchWithAuth('/api/google-calendar/connect-url');
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erro ao obter URL de conexão' }));
      throw new Error(error.error);
    }
    return res.json();
  },

  /**
   * Get Google Calendar connection status
   */
  async getStatus(): Promise<{
    connected: boolean;
    calendarId?: string;
    status?: string;
  }> {
    const res = await fetchWithAuth('/api/google-calendar/status');
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erro ao buscar status' }));
      throw new Error(error.error);
    }
    return res.json();
  },

  /**
   * Trigger manual sync with Google Calendar
   */
  async sync(): Promise<{ synced: number }> {
    const res = await fetchWithAuth('/api/google-calendar/sync', {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erro ao sincronizar' }));
      throw new Error(error.error);
    }
    return res.json();
  },

  /**
   * Disconnect Google Calendar
   */
  async disconnect(): Promise<void> {
    const res = await fetchWithAuth('/api/google-calendar/disconnect', {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erro ao desconectar' }));
      throw new Error(error.error);
    }
  },
};
