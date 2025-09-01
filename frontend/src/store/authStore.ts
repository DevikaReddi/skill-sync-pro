import { create } from 'zustand';
import { authService, User } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.login({ username, password });
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${user.username}!`);
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Login failed');
      return false;
    }
  },

  register: async (email: string, username: string, password: string, fullName?: string) => {
    set({ isLoading: true });
    try {
      await authService.register({ email, username, password, full_name: fullName });
      set({ isLoading: false });
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Registration failed');
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const user = await authService.getCurrentUser();
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  }
}));
