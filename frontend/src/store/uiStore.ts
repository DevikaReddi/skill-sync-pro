import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UIState } from '../types';

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isDarkMode: false,
        isMobileMenuOpen: false,
        activeTab: 'input',
        
        // Actions
        toggleDarkMode: () => {
          set((state) => ({ isDarkMode: !state.isDarkMode }));
        },
        
        toggleMobileMenu: () => {
          set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
        },
        
        setActiveTab: (tab: 'input' | 'results') => {
          set({ activeTab: tab });
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      }
    )
  )
);
