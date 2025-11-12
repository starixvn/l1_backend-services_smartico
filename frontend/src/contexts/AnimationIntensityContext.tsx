/**
 * AnimationIntensityContext provider for global animation preferences.
 */

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import type { AnimationIntensity } from '../types/dashboard/theme';
import { useThemeContext } from './ThemeContext';

/**
 * Animation intensity context type.
 */
interface AnimationIntensityContextType {
  intensity: AnimationIntensity;
  setIntensity: (intensity: AnimationIntensity) => void;
}

/**
 * Animation intensity context.
 */
const AnimationIntensityContext = createContext<AnimationIntensityContextType | undefined>(
  undefined
);

/**
 * AnimationIntensityProvider props.
 */
interface AnimationIntensityProviderProps {
  children: ReactNode;
}

/**
 * AnimationIntensityProvider component.
 * Provides animation intensity preference to all child components.
 *
 * @param props - Provider props
 * @returns AnimationIntensityProvider component
 */
export function AnimationIntensityProvider({ children }: AnimationIntensityProviderProps) {
  const { theme, setTheme } = useThemeContext();

  const setIntensity = useCallback(
    (intensity: AnimationIntensity) => {
      setTheme({ animationIntensity: intensity });
    },
    [setTheme]
  );

  const value = {
    intensity: theme.animationIntensity,
    setIntensity,
  };

  return (
    <AnimationIntensityContext.Provider value={value}>
      {children}
    </AnimationIntensityContext.Provider>
  );
}

/**
 * Hook to access animation intensity context.
 * Must be used within AnimationIntensityProvider.
 *
 * @returns Animation intensity context
 * @throws Error if used outside AnimationIntensityProvider
 */
export function useAnimationIntensityContext() {
  const context = useContext(AnimationIntensityContext);

  if (!context) {
    throw new Error('useAnimationIntensityContext must be used within AnimationIntensityProvider');
  }

  return context;
}
