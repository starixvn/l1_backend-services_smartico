/**
 * WidgetLayoutContext provider for global widget layout management.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useWidgetLayout } from '../hooks/useWidgetLayout';
import type { WidgetLayoutConfig } from '../types/dashboard/layout';
import type { WidgetId } from '../types/dashboard/widgets';

/**
 * Widget layout context type.
 */
interface WidgetLayoutContextType {
  layout: WidgetLayoutConfig;
  toggleWidget: (widgetId: WidgetId) => void;
  setWidgetVisibility: (widgetId: WidgetId, visible: boolean) => void;
  showAllWidgets: () => void;
  hideAllWidgets: () => void;
  resetLayout: () => void;
  getVisibleWidgets: () => WidgetId[];
}

/**
 * Widget layout context.
 */
const WidgetLayoutContext = createContext<WidgetLayoutContextType | undefined>(undefined);

/**
 * WidgetLayoutProvider props.
 */
interface WidgetLayoutProviderProps {
  children: ReactNode;
}

/**
 * WidgetLayoutProvider component.
 * Provides widget layout configuration to all child components.
 *
 * @param props - Provider props
 * @returns WidgetLayoutProvider component
 */
export function WidgetLayoutProvider({ children }: WidgetLayoutProviderProps) {
  const layoutHook = useWidgetLayout();

  return (
    <WidgetLayoutContext.Provider value={layoutHook}>
      {children}
    </WidgetLayoutContext.Provider>
  );
}

/**
 * Hook to access widget layout context.
 * Must be used within WidgetLayoutProvider.
 *
 * @returns Widget layout context
 * @throws Error if used outside WidgetLayoutProvider
 */
export function useWidgetLayoutContext() {
  const context = useContext(WidgetLayoutContext);

  if (!context) {
    throw new Error('useWidgetLayoutContext must be used within WidgetLayoutProvider');
  }

  return context;
}
