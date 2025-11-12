/**
 * Test utilities for rendering components with all dashboard providers.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DashboardProvider } from '../../contexts/DashboardProvider';

/**
 * Custom render function that wraps components with all dashboard providers.
 *
 * @param ui - Component to render
 * @param options - Render options
 * @returns Render result
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <DashboardProvider>{children}</DashboardProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Re-export everything from React Testing Library for convenience.
 */
export * from '@testing-library/react';
export { renderWithProviders as render };
