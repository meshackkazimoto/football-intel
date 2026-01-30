import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import type { ThemeMode } from '@/constants/theme';

const THEME_STORAGE_KEY = '@football_intel_theme';

type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        setThemeModeState(stored as ThemeMode);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themeMode === 'system') return systemScheme ?? 'light';
    return themeMode;
  }, [themeMode, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeMode, resolvedTheme, setThemeMode }),
    [themeMode, resolvedTheme, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
