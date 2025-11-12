/**
 * WidgetGrid Component
 * Responsive grid layout for dashboard widgets with visibility controls.
 */

import { useWidgetLayout } from '../../hooks/useWidgetLayout';
import type { WidgetId } from '../../types/dashboard/widgets';
import {
  // Phase 4 Widgets
  DailyChallengeWidget,
  LevelProgressWidget,
  ActiveMissionsWidget,
  RecentAchievementsWidget,
  LeaderboardWidget,
  // Phase 5 Widgets
  BonusTrackerWidget,
  MiniGamesWidget,
  TournamentWidget,
  JackpotWidget,
  ActivityFeedWidget,
  PersonalGoalsWidget,
  RewardCalendarWidget,
  StreakTrackerWidget,
  VIPStatusWidget,
} from './widgets';

/**
 * Widget registry mapping widget IDs to components.
 */
const WIDGET_REGISTRY: Record<WidgetId, React.ComponentType> = {
  'daily-challenge': DailyChallengeWidget,
  'level-progress': LevelProgressWidget,
  'active-missions': ActiveMissionsWidget,
  'recent-achievements': RecentAchievementsWidget,
  'leaderboard': LeaderboardWidget,
  'bonus-tracker': BonusTrackerWidget,
  'mini-games': MiniGamesWidget,
  'tournament': TournamentWidget,
  'jackpot': JackpotWidget,
  'activity-feed': ActivityFeedWidget,
  'personal-goals': PersonalGoalsWidget,
  'reward-calendar': RewardCalendarWidget,
  'streak-tracker': StreakTrackerWidget,
  'vip-status': VIPStatusWidget,
};

/**
 * Fixed widget layout configuration.
 * Defines the order and grid placement of all widgets.
 */
const WIDGET_LAYOUT: Array<{
  id: WidgetId;
  gridArea: string;
  className: string;
}> = [
  // Row 1: 3-column layout
  { id: 'daily-challenge', gridArea: 'daily', className: 'col-span-1' },
  { id: 'level-progress', gridArea: 'level', className: 'col-span-1' },
  { id: 'streak-tracker', gridArea: 'streak', className: 'col-span-1' },

  // Row 2: Full width
  { id: 'active-missions', gridArea: 'missions', className: 'col-span-full' },

  // Row 3: 2-column layout
  { id: 'tournament', gridArea: 'tournament', className: 'col-span-1 lg:col-span-1' },
  { id: 'jackpot', gridArea: 'jackpot', className: 'col-span-1 lg:col-span-1' },

  // Row 4: 2-column layout
  { id: 'bonus-tracker', gridArea: 'bonuses', className: 'col-span-1 lg:col-span-1' },
  { id: 'mini-games', gridArea: 'games', className: 'col-span-1 lg:col-span-1' },

  // Row 5: 2-column layout
  { id: 'personal-goals', gridArea: 'goals', className: 'col-span-1 lg:col-span-1' },
  { id: 'reward-calendar', gridArea: 'calendar', className: 'col-span-1 lg:col-span-1' },

  // Row 6: 2-column layout
  { id: 'vip-status', gridArea: 'vip', className: 'col-span-1 lg:col-span-1' },
  { id: 'activity-feed', gridArea: 'activity', className: 'col-span-1 lg:col-span-1' },

  // Row 7: 2-column layout
  { id: 'recent-achievements', gridArea: 'achievements', className: 'col-span-1 lg:col-span-1' },
  { id: 'leaderboard', gridArea: 'leaderboard', className: 'col-span-1 lg:col-span-1' },
];

/**
 * WidgetGrid component.
 * Renders all dashboard widgets in a responsive grid layout with visibility controls.
 */
export function WidgetGrid() {
  const { layout } = useWidgetLayout();

  // Filter visible widgets based on layout configuration
  const visibleWidgets = WIDGET_LAYOUT.filter(
    (widget) => layout.visibility[widget.id] !== false
  );

  return (
    <div className="space-y-6">
      {/* Responsive Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleWidgets.map((widget) => {
          const WidgetComponent = WIDGET_REGISTRY[widget.id];

          return (
            <div
              key={widget.id}
              className={widget.className}
              data-widget-id={widget.id}
            >
              <WidgetComponent />
            </div>
          );
        })}
      </div>

      {/* Empty State: All widgets hidden */}
      {visibleWidgets.length === 0 && (
        <div className="glass-dark-subtle p-12 rounded-xl border border-gray-500/30 text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-20 h-20 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            All Widgets Hidden
          </h3>
          <p className="text-gray-400 mb-4">
            You've hidden all widgets. Open the layout customizer to show widgets.
          </p>
          <button
            onClick={() => {
              // Trigger layout customizer modal
              // This will be implemented when we create LayoutCustomizer
              const event = new CustomEvent('open-layout-customizer');
              window.dispatchEvent(event);
            }}
            className="
              px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600
              hover:from-purple-700 hover:to-pink-700
              text-white font-medium rounded-lg
              transition-all shadow-lg shadow-purple-500/30
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
            "
          >
            Open Layout Customizer
          </button>
        </div>
      )}
    </div>
  );
}
