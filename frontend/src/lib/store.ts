import { create } from 'zustand';
import { Board, Card, CreateCardData, UpdateCardData, MoveCardData, Metrics } from './types';
import { api } from './api';

interface KanbanStore {
  board: Board | null;
  metrics: Metrics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBoard: (token: string) => Promise<void>;
  fetchMetrics: (token: string) => Promise<void>;
  createCard: (data: CreateCardData, token: string) => Promise<void>;
  updateCard: (id: string, data: UpdateCardData, token: string) => Promise<void>;
  deleteCard: (id: string, token: string) => Promise<void>;
  moveCard: (data: MoveCardData, token: string) => Promise<void>;
  createColumn: (name: string, token: string) => Promise<void>;
  deleteColumn: (id: string, token: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  board: null,
  metrics: null,
  isLoading: false,
  error: null,

  fetchBoard: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await api.getBoard(token);
      set({ board, isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar board', isLoading: false });
      console.error(error);
    }
  },

  fetchMetrics: async (token: string) => {
    try {
      const metrics = await api.getMetrics(token);
      set({ metrics });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  },

  createCard: async (data: CreateCardData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.createCard(data, token);
      await get().fetchBoard(token);
      await get().fetchMetrics(token);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao criar card', isLoading: false });
      console.error(error);
    }
  },

  updateCard: async (id: string, data: UpdateCardData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.updateCard(id, data, token);
      await get().fetchBoard(token);
      await get().fetchMetrics(token);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao atualizar card', isLoading: false });
      console.error(error);
    }
  },

  deleteCard: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteCard(id, token);
      await get().fetchBoard(token);
      await get().fetchMetrics(token);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao deletar card', isLoading: false });
      console.error(error);
    }
  },

  moveCard: async (data: MoveCardData, token: string) => {
    try {
      await api.moveCard(data, token);
      await get().fetchBoard(token);
      await get().fetchMetrics(token);
    } catch (error) {
      set({ error: 'Erro ao mover card' });
      console.error(error);
    }
  },

  createColumn: async (name: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const { board } = get();
      if (!board) throw new Error('Board não encontrado');

      await api.createColumn(board.id, name, token);
      await get().fetchBoard(token);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao criar coluna', isLoading: false });
      console.error(error);
    }
  },

  deleteColumn: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteColumn(id, token);
      await get().fetchBoard(token);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao deletar coluna', isLoading: false });
      console.error(error);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
