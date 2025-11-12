/**
 * ThemeContext provider for global theme management.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { ThemeConfig } from '../types/dashboard/theme';

/**
 * Theme context type.
 */
interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

/**
 * Theme context.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider props.
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component.
 * Provides theme configuration to all child components.
 *
 * @param props - Provider props
 * @returns ThemeProvider component
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeHook = useTheme();

  return (
    <ThemeContext.Provider value={themeHook}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * Must be used within ThemeProvider.
 *
 * @returns Theme context
 * @throws Error if used outside ThemeProvider
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return context;
}
