import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ThemeName } from '@/config/themes';

type ThemeState = {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    immer((set) => ({
      themeName: 'modern-collector' as ThemeName,
      setTheme: (name) =>
        set((state) => {
          state.themeName = name;
        }),
    })),
    {
      name: 'tcg-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
