import { create } from 'zustand';
import { Board, Card, CreateCardData, UpdateCardData, MoveCardData, Metrics } from './types';
import { api } from './api';

interface KanbanStore {
  board: Board | null;
  metrics: Metrics | null;
  isLoading: boolean;
  error: string | null;
  teamId: string | null;

  // Actions
  fetchBoard: (teamId: string, token: string) => Promise<void>;
  fetchMetrics: (teamId: string, token: string) => Promise<void>;
  createCard: (data: CreateCardData, token: string) => Promise<void>;
  updateCard: (id: string, data: UpdateCardData, token: string) => Promise<void>;
  deleteCard: (id: string, token: string) => Promise<void>;
  moveCard: (data: MoveCardData, token: string) => Promise<void>;
  createColumn: (name: string, token: string) => Promise<void>;
  deleteColumn: (id: string, token: string) => Promise<void>;
  reorderColumns: (columnIds: string[], token: string) => Promise<void>;
  clearBoard: () => void;
  setError: (error: string | null) => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  board: null,
  metrics: null,
  isLoading: false,
  error: null,
  teamId: null,

  fetchBoard: async (teamId: string, token: string) => {
    set({ isLoading: true, error: null, teamId });
    console.log('🔍 Fetching board for teamId:', teamId);
    try {
      const board = await api.getBoard(teamId, token);
      console.log('✅ Board loaded:', board.id, 'for team:', teamId);
      set({ board, isLoading: false });
    } catch (error) {
      console.error('❌ Error loading board:', error);
      set({ error: 'Erro ao carregar board', isLoading: false });
      console.error(error);
    }
  },

  fetchMetrics: async (teamId: string, token: string) => {
    try {
      const metrics = await api.getMetrics(teamId, token);
      set({ metrics });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  },

  createCard: async (data: CreateCardData, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.createCard(data, token);
      const { teamId } = get();
      if (teamId) {
        await get().fetchBoard(teamId, token);
        await get().fetchMetrics(teamId, token);
      }
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
      const { teamId } = get();
      if (teamId) {
        await get().fetchBoard(teamId, token);
        await get().fetchMetrics(teamId, token);
      }
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
      const { teamId } = get();
      if (teamId) {
        await get().fetchBoard(teamId, token);
        await get().fetchMetrics(teamId, token);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao deletar card', isLoading: false });
      console.error(error);
    }
  },

  moveCard: async (data: MoveCardData, token: string) => {
    try {
      await api.moveCard(data, token);
      const { teamId } = get();
      if (teamId) {
        await get().fetchBoard(teamId, token);
        await get().fetchMetrics(teamId, token);
      }
    } catch (error) {
      set({ error: 'Erro ao mover card' });
      console.error(error);
    }
  },

  createColumn: async (name: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const { board, teamId } = get();
      if (!board) throw new Error('Board não encontrado');

      await api.createColumn(board.id, name, token);
      if (teamId) {
        await get().fetchBoard(teamId, token);
      }
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
      const { teamId } = get();
      if (teamId) {
        await get().fetchBoard(teamId, token);
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao deletar coluna', isLoading: false });
      console.error(error);
    }
  },

  reorderColumns: async (columnIds: string[], token: string) => {
    set({ isLoading: true, error: null });
    try {
      const { board } = get();
      if (!board) throw new Error('Board não encontrado');

      await api.reorderColumns(board.id, columnIds, token);
      await get().fetchBoard(board.teamId || '', token);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao reordenar colunas', isLoading: false });
      console.error(error);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearBoard: () => {
    console.log('🧹 Clearing board state');
    set({ board: null, metrics: null, teamId: null });
  },
}));
