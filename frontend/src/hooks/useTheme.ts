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
   * Preset color mappings.
   */
  const PRESET_COLORS: Record<string, { primary: string; accent: string }> = {
    'royal-purple': { primary: '#9333ea', accent: '#ec4899' },
    'ocean-blue': { primary: '#0ea5e9', accent: '#06b6d4' },
    'neon-cyber': { primary: '#10b981', accent: '#8b5cf6' },
    'nature-zen': { primary: '#22c55e', accent: '#84cc16' },
    'sunset-orange': { primary: '#f97316', accent: '#ef4444' },
  };

  /**
   * Apply theme to document root (CSS variables).
   */
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme mode
    root.setAttribute('data-theme', theme.mode);

    // Apply font size
    root.style.setProperty('--base-font-size', `${theme.fontSize}px`);

    // Apply colors based on preset or custom
    if (theme.preset === 'custom') {
      if (theme.primaryColor) {
        root.style.setProperty('--color-primary', theme.primaryColor);
      }
      if (theme.accentColor) {
        root.style.setProperty('--color-accent', theme.accentColor);
      }
    } else {
      // Apply preset colors
      const presetColors = PRESET_COLORS[theme.preset];
      if (presetColors) {
        root.style.setProperty('--color-primary', presetColors.primary);
        root.style.setProperty('--color-accent', presetColors.accent);
      }
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
