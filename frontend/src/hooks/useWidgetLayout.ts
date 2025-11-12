/**
 * useWidgetLayout hook for managing widget visibility with localStorage persistence.
 * Simplified version without drag-and-drop (fixed order, visibility toggles only).
 */

import { useState, useCallback } from 'react';
import {
  WidgetLayoutConfig,
  DEFAULT_WIDGET_LAYOUT,
  WIDGET_LAYOUT_STORAGE_KEY,
} from '../types/dashboard/layout';
import { WidgetId, WIDGET_ORDER } from '../types/dashboard/widgets';

/**
 * Custom hook for widget layout management (visibility only - fixed order, no drag-and-drop).
 *
 * @returns Layout configuration and setter functions
 */
export function useWidgetLayout() {
  const [layout, setLayoutState] = useState<WidgetLayoutConfig>(() => {
    // Load layout from localStorage on mount
    try {
      const stored = localStorage.getItem(WIDGET_LAYOUT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WidgetLayoutConfig;
        // Validate parsed layout has visibility
        if (parsed.visibility && typeof parsed.visibility === 'object') {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load widget layout from localStorage:', error);
    }
    return DEFAULT_WIDGET_LAYOUT;
  });

  /**
   * Toggle widget visibility.
   */
  const toggleWidget = useCallback((widgetId: WidgetId) => {
    setLayoutState((prevLayout) => {
      const updatedLayout = {
        ...prevLayout,
        visibility: {
          ...prevLayout.visibility,
          [widgetId]: !prevLayout.visibility[widgetId],
        },
      };

      // Persist to localStorage
      try {
        localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(updatedLayout));
      } catch (error) {
        console.error('Failed to save widget layout to localStorage:', error);
      }

      return updatedLayout;
    });
  }, []);

  /**
   * Set visibility for a specific widget.
   */
  const setWidgetVisibility = useCallback((widgetId: WidgetId, visible: boolean) => {
    setLayoutState((prevLayout) => {
      const updatedLayout = {
        ...prevLayout,
        visibility: {
          ...prevLayout.visibility,
          [widgetId]: visible,
        },
      };

      // Persist to localStorage
      try {
        localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(updatedLayout));
      } catch (error) {
        console.error('Failed to save widget layout to localStorage:', error);
      }

      return updatedLayout;
    });
  }, []);

  /**
   * Show all widgets.
   */
  const showAllWidgets = useCallback(() => {
    setLayoutState((prevLayout) => {
      const updatedLayout = {
        ...prevLayout,
        visibility: Object.fromEntries(
          WIDGET_ORDER.map((widgetId) => [widgetId, true])
        ) as Record<WidgetId, boolean>,
      };

      // Persist to localStorage
      try {
        localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(updatedLayout));
      } catch (error) {
        console.error('Failed to save widget layout to localStorage:', error);
      }

      return updatedLayout;
    });
  }, []);

  /**
   * Hide all widgets.
   */
  const hideAllWidgets = useCallback(() => {
    setLayoutState((prevLayout) => {
      const updatedLayout = {
        ...prevLayout,
        visibility: Object.fromEntries(
          WIDGET_ORDER.map((widgetId) => [widgetId, false])
        ) as Record<WidgetId, boolean>,
      };

      // Persist to localStorage
      try {
        localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(updatedLayout));
      } catch (error) {
        console.error('Failed to save widget layout to localStorage:', error);
      }

      return updatedLayout;
    });
  }, []);

  /**
   * Reset layout to default (all widgets visible).
   */
  const resetLayout = useCallback(() => {
    setLayoutState(DEFAULT_WIDGET_LAYOUT);
    try {
      localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(DEFAULT_WIDGET_LAYOUT));
    } catch (error) {
      console.error('Failed to reset widget layout in localStorage:', error);
    }
  }, []);

  /**
   * Get visible widgets in fixed order.
   */
  const getVisibleWidgets = useCallback((): WidgetId[] => {
    return WIDGET_ORDER.filter((widgetId) => layout.visibility[widgetId]);
  }, [layout.visibility]);

  return {
    layout,
    toggleWidget,
    setWidgetVisibility,
    showAllWidgets,
    hideAllWidgets,
    resetLayout,
    getVisibleWidgets,
  };
}
