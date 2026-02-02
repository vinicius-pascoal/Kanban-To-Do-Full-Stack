const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // Board
  async getBoard() {
    const res = await fetch(`${API_URL}/api/board`);
    if (!res.ok) throw new Error('Erro ao buscar board');
    return res.json();
  },

  async createBoard(name: string) {
    const res = await fetch(`${API_URL}/api/board`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Erro ao criar board');
    return res.json();
  },

  // Cards
  async createCard(data: any) {
    const res = await fetch(`${API_URL}/api/card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao criar card');
    return res.json();
  },

  async getCard(id: string) {
    const res = await fetch(`${API_URL}/api/card/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar card');
    return res.json();
  },

  async updateCard(id: string, data: any) {
    const res = await fetch(`${API_URL}/api/card/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar card');
    return res.json();
  },

  async deleteCard(id: string) {
    const res = await fetch(`${API_URL}/api/card/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao deletar card');
  },

  async moveCard(data: any) {
    const res = await fetch(`${API_URL}/api/card/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao mover card');
    return res.json();
  },

  // Metrics
  async getMetrics() {
    const res = await fetch(`${API_URL}/api/metrics`);
    if (!res.ok) throw new Error('Erro ao buscar métricas');
    return res.json();
  },
};
