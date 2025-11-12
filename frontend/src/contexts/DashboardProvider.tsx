/**
 * DashboardProvider - Wrapper for all dashboard context providers.
 */

import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { WidgetLayoutProvider } from './WidgetLayoutContext';
import { AnimationIntensityProvider } from './AnimationIntensityContext';

/**
 * DashboardProvider props.
 */
interface DashboardProviderProps {
  children: ReactNode;
}

/**
 * DashboardProvider component.
 * Wraps all dashboard context providers in the correct order.
 *
 * Provider hierarchy:
 * 1. ThemeProvider (base theme configuration)
 * 2. AnimationIntensityProvider (depends on ThemeProvider)
 * 3. WidgetLayoutProvider (independent)
 *
 * @param props - Provider props
 * @returns DashboardProvider component
 */
export function DashboardProvider({ children }: DashboardProviderProps) {
  return (
    <ThemeProvider>
      <AnimationIntensityProvider>
        <WidgetLayoutProvider>
          {children}
        </WidgetLayoutProvider>
      </AnimationIntensityProvider>
    </ThemeProvider>
  );
}
