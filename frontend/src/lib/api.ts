const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getHeaders = (token?: string) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async register(email: string, password: string, name: string) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao registrar');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }
    return res.json();
  },

  // Teams
  async getTeams(token: string) {
    const res = await fetch(`${API_URL}/api/team`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar times');
    return res.json();
  },

  async getTeam(id: string, token: string) {
    const res = await fetch(`${API_URL}/api/team/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar time');
    return res.json();
  },

  async createTeam(name: string, token: string) {
    const res = await fetch(`${API_URL}/api/team`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Erro ao criar time');
    return res.json();
  },

  async addTeamMember(teamId: string, email: string, token: string) {
    const res = await fetch(`${API_URL}/api/team/${teamId}/members`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao adicionar membro');
    }
    return res.json();
  },

  async removeTeamMember(teamId: string, userId: string, token: string) {
    const res = await fetch(`${API_URL}/api/team/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao remover membro');
  },

  async deleteTeam(teamId: string, token: string) {
    const res = await fetch(`${API_URL}/api/team/${teamId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao deletar time');
  },

  // Board
  async getBoard(teamId: string, token: string) {
    const res = await fetch(`${API_URL}/api/board?teamId=${teamId}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar board');
    return res.json();
  },

  async createBoard(name: string, token: string) {
    const res = await fetch(`${API_URL}/api/board`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Erro ao criar board');
    return res.json();
  },

  // Columns
  async getColumns(token: string) {
    const res = await fetch(`${API_URL}/api/column`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar colunas');
    return res.json();
  },

  async createColumn(boardId: string, name: string, token: string, color?: string | null) {
    const res = await fetch(`${API_URL}/api/column`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ boardId, name, color }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erro ao criar coluna' }));
      throw new Error(error.error || 'Erro ao criar coluna');
    }
    return res.json();
  },

  async deleteColumn(id: string, token: string) {
    const res = await fetch(`${API_URL}/api/column/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao deletar coluna');
    }
  },

  async updateColumn(id: string, name: string, token: string, color?: string | null) {
    const res = await fetch(`${API_URL}/api/column/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar coluna');
    return res.json();
  },

  async reorderColumns(boardId: string, columnIds: string[], token: string) {
    const res = await fetch(`${API_URL}/api/column/reorder/${boardId}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ columnIds }),
    });
    if (!res.ok) throw new Error('Erro ao reordenar colunas');
    return res.json();
  },

  // Cards
  async createCard(data: any, token: string) {
    const res = await fetch(`${API_URL}/api/card`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao criar card');
    return res.json();
  },

  async getCard(id: string, token: string) {
    const res = await fetch(`${API_URL}/api/card/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar card');
    return res.json();
  },

  async updateCard(id: string, data: any, token: string) {
    const res = await fetch(`${API_URL}/api/card/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar card');
    return res.json();
  },

  async deleteCard(id: string, token: string) {
    const res = await fetch(`${API_URL}/api/card/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao deletar card');
  },

  async moveCard(data: any, token: string) {
    const res = await fetch(`${API_URL}/api/card/move`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao mover card');
    return res.json();
  },

  async getMyCards(token: string) {
    const res = await fetch(`${API_URL}/api/card/user/my-cards`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar meus cards');
    return res.json();
  },

  // Metrics
  async getMetrics(teamId: string, token: string) {
    const res = await fetch(`${API_URL}/api/metrics?teamId=${teamId}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erro ao buscar métricas');
    return res.json();
  },
};
