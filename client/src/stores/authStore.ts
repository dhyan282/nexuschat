import { create } from 'zustand';

interface User { _id: string; name: string; username: string; email: string; avatar?: string; role: string; status?: string; bio?: string; phone?: string; }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  setAuth: (user, token) => { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('accessToken', token); set({ user, accessToken: token }); },
  setUser: (user) => { localStorage.setItem('user', JSON.stringify(user)); set({ user }); },
  logout: () => { localStorage.removeItem('user'); localStorage.removeItem('accessToken'); set({ user: null, accessToken: null }); },
}));
