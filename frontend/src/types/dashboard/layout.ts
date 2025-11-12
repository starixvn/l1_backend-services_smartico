/**
 * Widget layout configuration for the Gamification Dashboard.
 * Persisted to localStorage as 'smartico-widget-layout'.
 *
 * NOTE: Simplified version without drag-and-drop.
 * Widgets are displayed in a fixed order with visibility toggles only.
 */

import type { WidgetId } from './widgets';

/**
 * Widget layout configuration (visibility only - fixed order, no drag-and-drop).
 * Persisted to localStorage as 'smartico-widget-layout'.
 */
export interface WidgetLayoutConfig {
  /** Visibility map for each widget */
  visibility: Record<WidgetId, boolean>;
}

/**
 * Default widget layout (all widgets visible).
 */
export const DEFAULT_WIDGET_LAYOUT: WidgetLayoutConfig = {
  visibility: {
    'daily-challenge': true,
    'level-progress': true,
    'active-missions': true,
    'recent-achievements': true,
    'leaderboard': true,
    'bonus-tracker': true,
    'mini-games': true,
    'tournament': true,
    'jackpot': true,
    'activity-feed': true,
    'personal-goals': true,
    'reward-calendar': true,
    'streak-tracker': true,
    'vip-status': true,
  },
};

/**
 * LocalStorage key for widget layout configuration
 */
export const WIDGET_LAYOUT_STORAGE_KEY = 'smartico-widget-layout';
