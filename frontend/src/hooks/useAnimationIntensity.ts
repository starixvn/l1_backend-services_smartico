/**
 * useAnimationIntensity hook for managing animation preferences.
 */

import { useContext, createContext } from 'react';
import type { AnimationIntensity } from '../types/dashboard/theme';

/**
 * Animation intensity context type.
 */
interface AnimationIntensityContextType {
  intensity: AnimationIntensity;
  setIntensity: (intensity: AnimationIntensity) => void;
}

/**
 * Animation intensity context (created in AnimationIntensityContext.tsx).
 * This is a placeholder - the actual context is created in the Context provider.
 */
export const AnimationIntensityContext = createContext<AnimationIntensityContextType | undefined>(
  undefined
);

/**
 * Custom hook for accessing animation intensity from context.
 * Must be used within AnimationIntensityProvider.
 *
 * @returns Animation intensity and setter
 * @throws Error if used outside AnimationIntensityProvider
 */
export function useAnimationIntensity() {
  const context = useContext(AnimationIntensityContext);

  if (!context) {
    throw new Error('useAnimationIntensity must be used within AnimationIntensityProvider');
  }

  return context;
}

/**
 * Get animation duration multiplier based on intensity.
 *
 * @param baseMs - Base duration in milliseconds
 * @param intensity - Animation intensity level
 * @returns Adjusted duration in milliseconds
 */
export function getAnimationDuration(baseMs: number, intensity: AnimationIntensity): number {
  switch (intensity) {
    case 'none':
      return 0;
    case 'subtle':
      return baseMs * 0.5;
    case 'moderate':
      return baseMs;
    case 'full':
      return baseMs * 1.5;
    default:
      return baseMs;
  }
}

/**
 * Check if animations should be disabled based on intensity.
 *
 * @param intensity - Animation intensity level
 * @returns True if animations should be disabled
 */
export function shouldDisableAnimations(intensity: AnimationIntensity): boolean {
  return intensity === 'none';
}
