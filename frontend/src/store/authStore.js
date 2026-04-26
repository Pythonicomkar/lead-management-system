import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authAPI.login(username, password);
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Login failed',
          });
          return false;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.register(userData);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.detail || 'Registration failed',
          });
          return false;
        }
      },
      
      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);