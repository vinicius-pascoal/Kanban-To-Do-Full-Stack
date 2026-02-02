import { create } from 'zustand';
import { Board, Card, CreateCardData, UpdateCardData, MoveCardData, Metrics } from './types';
import { api } from './api';

interface KanbanStore {
  board: Board | null;
  metrics: Metrics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBoard: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  createCard: (data: CreateCardData) => Promise<void>;
  updateCard: (id: string, data: UpdateCardData) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (data: MoveCardData) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  board: null,
  metrics: null,
  isLoading: false,
  error: null,

  fetchBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const board = await api.getBoard();
      set({ board, isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar board', isLoading: false });
      console.error(error);
    }
  },

  fetchMetrics: async () => {
    try {
      const metrics = await api.getMetrics();
      set({ metrics });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  },

  createCard: async (data: CreateCardData) => {
    set({ isLoading: true, error: null });
    try {
      await api.createCard(data);
      await get().fetchBoard();
      await get().fetchMetrics();
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao criar card', isLoading: false });
      console.error(error);
    }
  },

  updateCard: async (id: string, data: UpdateCardData) => {
    set({ isLoading: true, error: null });
    try {
      await api.updateCard(id, data);
      await get().fetchBoard();
      await get().fetchMetrics();
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao atualizar card', isLoading: false });
      console.error(error);
    }
  },

  deleteCard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteCard(id);
      await get().fetchBoard();
      await get().fetchMetrics();
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao deletar card', isLoading: false });
      console.error(error);
    }
  },

  moveCard: async (data: MoveCardData) => {
    try {
      await api.moveCard(data);
      await get().fetchBoard();
      await get().fetchMetrics();
    } catch (error) {
      set({ error: 'Erro ao mover card' });
      console.error(error);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
