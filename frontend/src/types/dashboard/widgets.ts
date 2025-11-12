/**
 * Widget identifiers for all 14 widgets in the Gamification Dashboard.
 */

/**
 * Widget identifiers for all 14 widgets.
 */
export type WidgetId =
  | 'daily-challenge'
  | 'level-progress'
  | 'active-missions'
  | 'recent-achievements'
  | 'leaderboard'
  | 'bonus-tracker'
  | 'mini-games'
  | 'tournament'
  | 'jackpot'
  | 'activity-feed'
  | 'personal-goals'
  | 'reward-calendar'
  | 'streak-tracker'
  | 'vip-status';

/**
 * Fixed widget order (used for rendering in the grid).
 * This defines the default order in which widgets appear on the dashboard.
 */
export const WIDGET_ORDER: readonly WidgetId[] = [
  'daily-challenge',
  'level-progress',
  'active-missions',
  'recent-achievements',
  'leaderboard',
  'bonus-tracker',
  'mini-games',
  'tournament',
  'jackpot',
  'activity-feed',
  'personal-goals',
  'reward-calendar',
  'streak-tracker',
  'vip-status',
] as const;

/**
 * Widget display names for UI labels.
 */
export const WIDGET_NAMES: Record<WidgetId, string> = {
  'daily-challenge': 'Daily Challenge',
  'level-progress': 'Level Progress',
  'active-missions': 'Active Missions',
  'recent-achievements': 'Recent Achievements',
  'leaderboard': 'Leaderboard',
  'bonus-tracker': 'Bonus Tracker',
  'mini-games': 'Mini Games',
  'tournament': 'Tournament',
  'jackpot': 'Jackpot',
  'activity-feed': 'Activity Feed',
  'personal-goals': 'Personal Goals',
  'reward-calendar': 'Reward Calendar',
  'streak-tracker': 'Streak Tracker',
  'vip-status': 'VIP Status',
};
