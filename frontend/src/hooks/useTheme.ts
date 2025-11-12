/**
 * useTheme hook for managing theme configuration with localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ThemeConfig,
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
} from '../types/dashboard/theme';

/**
 * Custom hook for theme management with localStorage persistence.
 * Default theme: Royal Purple Dark Glassmorphism.
 *
 * @returns Theme configuration and setter function
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    // Load theme from localStorage on mount
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ThemeConfig;
        // Validate parsed theme has required fields
        if (parsed.mode && parsed.preset && parsed.fontSize && parsed.animationIntensity) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
    return DEFAULT_THEME_CONFIG;
  });

  /**
   * Update theme configuration and persist to localStorage.
   */
  const setTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setThemeState((prevTheme) => {
      const updatedTheme = { ...prevTheme, ...newTheme };

      // Persist to localStorage
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updatedTheme));
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }

      return updatedTheme;
    });
  }, []);

  /**
   * Reset theme to default (Royal Purple Dark Glassmorphism).
   */
  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME_CONFIG);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(DEFAULT_THEME_CONFIG));
    } catch (error) {
      console.error('Failed to reset theme in localStorage:', error);
    }
  }, []);

  /**
   * Apply theme to document root (CSS variables).
   */
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme mode
    root.setAttribute('data-theme', theme.mode);

    // Apply font size
    root.style.setProperty('--base-font-size', `${theme.fontSize}px`);

    // Apply custom colors (if custom preset)
    if (theme.preset === 'custom') {
      if (theme.primaryColor) {
        root.style.setProperty('--color-primary', theme.primaryColor);
      }
      if (theme.accentColor) {
        root.style.setProperty('--color-accent', theme.accentColor);
      }
    } else {
      // Remove custom colors if switching to preset
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
    }

    // Apply animation intensity as CSS variable
    root.style.setProperty('--animation-intensity', theme.animationIntensity);
  }, [theme]);

  return {
    theme,
    setTheme,
    resetTheme,
  };
}
