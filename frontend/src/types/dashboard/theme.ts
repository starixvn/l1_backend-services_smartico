/**
 * Theme configuration for the Gamification Dashboard.
 * Persisted to localStorage as 'smartico-theme-config'.
 */

/**
 * Theme mode: light or dark
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Available theme presets
 */
export type ThemePreset =
  | 'royal-purple'
  | 'ocean-blue'
  | 'neon-cyber'
  | 'nature-zen'
  | 'sunset-orange'
  | 'custom';

/**
 * Font size options in pixels
 */
export type FontSize = 14 | 16 | 18;

/**
 * Animation intensity levels
 */
export type AnimationIntensity = 'none' | 'subtle' | 'moderate' | 'full';

/**
 * User theme configuration for dashboard customization.
 * Persisted to localStorage as 'smartico-theme-config'.
 */
export interface ThemeConfig {
  /** Theme mode: light or dark */
  mode: ThemeMode;

  /** Selected theme preset */
  preset: ThemePreset;

  /** Custom primary color (hex) - only used when preset is 'custom' */
  primaryColor?: string;

  /** Custom accent color (hex) - only used when preset is 'custom' */
  accentColor?: string;

  /** Base font size in pixels */
  fontSize: FontSize;

  /** Animation intensity level */
  animationIntensity: AnimationIntensity;
}

/**
 * Default theme configuration (Royal Purple Dark Glassmorphism).
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'dark',
  preset: 'royal-purple',
  fontSize: 16,
  animationIntensity: 'moderate',
};

/**
 * LocalStorage key for theme configuration
 */
export const THEME_STORAGE_KEY = 'smartico-theme-config';
