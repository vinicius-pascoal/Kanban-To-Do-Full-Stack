import { create } from 'zustand';
import { User, Team, Board } from './types';
import { api } from './api';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  teams: Team[] | null;
  currentTeam: Team | null;
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthStoreActions {
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchTeams: () => Promise<void>;
  fetchTeam: (id: string) => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  addTeamMember: (email: string) => Promise<void>;
  removeTeamMember: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

const initializeFromLocalStorage = () => {
  if (typeof window === 'undefined') return { user: null, token: null };

  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initializeFromLocalStorage(),
  teams: null,
  currentTeam: null,
  currentBoard: null,
  isLoading: false,
  error: null,

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.register(email, password, name);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, teams: null, currentTeam: null });
  },

  fetchTeams: async () => {
    const { token } = get();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const teams = await api.getTeams(token);
      set({ teams, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTeam: async (id: string) => {
    const { token } = get();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const team = await api.getTeam(id, token);
      set({ currentTeam: team, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTeam: async (name: string) => {
    const { token } = get();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      await api.createTeam(name, token);
      await get().fetchTeams();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTeamMember: async (email: string) => {
    const { token, currentTeam } = get();
    if (!token || !currentTeam) return;

    set({ isLoading: true, error: null });
    try {
      await api.addTeamMember(currentTeam.id, email, token);
      await get().fetchTeam(currentTeam.id);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeTeamMember: async (userId: string) => {
    const { token, currentTeam } = get();
    if (!token || !currentTeam) return;

    set({ isLoading: true, error: null });
    try {
      await api.removeTeamMember(currentTeam.id, userId, token);
      await get().fetchTeam(currentTeam.id);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
