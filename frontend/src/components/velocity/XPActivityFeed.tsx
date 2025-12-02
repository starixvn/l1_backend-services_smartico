/**
 * XPActivityFeed Component
 * T059-T061: Feed displaying recent XP earning activities with filtering.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { XPActivityItem } from './XPActivityItem';
import type { XpActivity, XpActivityType } from '../../types/velocity';

/**
 * Props for XPActivityFeed component.
 */
export interface XPActivityFeedProps {
  /** List of XP activities */
  activities: XpActivity[];
  /** Total count of activities available */
  totalCount?: number;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when load more is requested */
  onLoadMore?: () => void;
  /** Whether more activities can be loaded */
  hasMore?: boolean;
  /** Currently active filter type */
  filterType?: XpActivityType | null;
  /** Callback when filter changes */
  onFilterChange?: (type: XpActivityType | null) => void;
  /** Callback when an activity is clicked */
  onActivityClick?: (activity: XpActivity) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Filter button configuration.
 */
interface FilterConfig {
  type: XpActivityType | null;
  label: string;
  icon: string;
}

/**
 * Available filter options.
 */
const FILTER_OPTIONS: FilterConfig[] = [
  { type: null, label: 'All', icon: '📊' },
  { type: 'slot_play', label: 'Slots', icon: '🎰' },
  { type: 'table_play', label: 'Tables', icon: '🃏' },
  { type: 'mission_complete', label: 'Missions', icon: '🎯' },
  { type: 'bonus', label: 'Bonus', icon: '🎁' },
];

/**
 * Loading skeleton for activity items.
 */
function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-700" />
      <div className="flex-grow">
        <div className="h-3 w-16 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-700 rounded" />
      </div>
      <div className="text-right">
        <div className="h-5 w-10 bg-slate-700 rounded mb-1" />
        <div className="h-3 w-6 bg-slate-700 rounded" />
      </div>
      <div className="h-3 w-12 bg-slate-700 rounded" />
    </div>
  );
}

/**
 * Calculates daily XP totals from activities.
 */
function calculateDailyTotal(activities: XpActivity[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return activities
    .filter(activity => new Date(activity.timestamp) >= today)
    .reduce((sum, activity) => sum + activity.xpEarned, 0);
}

/**
 * XPActivityFeed component.
 * Displays recent XP activities with filtering and lazy loading.
 *
 * @param props - Component props
 * @returns XP activity feed element
 *
 * @example
 * ```tsx
 * <XPActivityFeed
 *   activities={recentActivities}
 *   isLoading={isLoading}
 *   onLoadMore={loadMore}
 *   hasMore={hasMore}
 *   filterType={filter}
 *   onFilterChange={setFilter}
 * />
 * ```
 */
export function XPActivityFeed({
  activities,
  totalCount,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  filterType = null,
  onFilterChange,
  onActivityClick,
  className = '',
}: XPActivityFeedProps) {
  const prefersReducedMotion = useReducedMotion();
  const [localFilter, setLocalFilter] = useState<XpActivityType | null>(filterType);

  // Use controlled or uncontrolled filter state
  const activeFilter = onFilterChange ? filterType : localFilter;
  const handleFilterChange = (type: XpActivityType | null) => {
    if (onFilterChange) {
      onFilterChange(type);
    } else {
      setLocalFilter(type);
    }
  };

  // Filter activities locally if no external filter handler
  const displayedActivities = useMemo(() => {
    if (onFilterChange || !activeFilter) {
      return activities;
    }
    return activities.filter(a => a.type === activeFilter);
  }, [activities, activeFilter, onFilterChange]);

  // Calculate today's total
  const todayTotal = useMemo(() => calculateDailyTotal(activities), [activities]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-dark rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">
            Recent XP Activity
          </h3>

          {/* Today's total */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Today's XP</p>
            <p className="text-lg font-bold text-green-400">
              +{todayTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {FILTER_OPTIONS.map(option => (
            <button
              key={option.type ?? 'all'}
              onClick={() => handleFilterChange(option.type)}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg
                text-xs font-medium whitespace-nowrap
                transition-all duration-200
                ${activeFilter === option.type
                  ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {/* Loading skeletons */}
          {isLoading && displayedActivities.length === 0 && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ActivitySkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && displayedActivities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500">
                {activeFilter
                  ? `No ${FILTER_OPTIONS.find(f => f.type === activeFilter)?.label.toLowerCase()} activity yet`
                  : 'No XP activity yet. Start playing to earn XP!'
                }
              </p>
            </motion.div>
          )}

          {/* Activity items */}
          {displayedActivities.length > 0 && (
            <div className="space-y-2">
              {displayedActivities.map((activity, index) => (
                <XPActivityItem
                  key={activity.id}
                  activity={activity}
                  index={index}
                  onClick={onActivityClick}
                />
              ))}

              {/* Loading more indicator */}
              {isLoading && displayedActivities.length > 0 && (
                <div className="py-4">
                  <ActivitySkeleton />
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Load more button */}
      {hasMore && onLoadMore && !isLoading && (
        <div className="px-4 pb-4">
          <button
            onClick={onLoadMore}
            className="
              w-full py-2 px-4 rounded-lg
              bg-slate-800/50 text-gray-400
              hover:bg-slate-700/50 hover:text-white
              transition-all duration-200
              text-sm font-medium
            "
          >
            Load More Activities
          </button>
        </div>
      )}

      {/* Footer with total count */}
      {totalCount !== undefined && (
        <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700/50">
          <p className="text-xs text-gray-500 text-center">
            Showing {displayedActivities.length} of {totalCount} activities
          </p>
        </div>
      )}
    </motion.div>
  );
}
