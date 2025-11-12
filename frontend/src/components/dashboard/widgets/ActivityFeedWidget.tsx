/**
 * ActivityFeedWidget Component
 * Displays recent activity events in real-time feed format.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';
import type { ActivityEvent } from '../../../types/dashboard/data';

/**
 * Activity type icon and color mapping.
 */
const ACTIVITY_CONFIG: Record<
  ActivityEvent['type'],
  { icon: string; color: string; bgColor: string }
> = {
  'level-up': {
    icon: '⬆️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  'mission-complete': {
    icon: '✅',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  achievement: {
    icon: '🏆',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  'bonus-claim': {
    icon: '🎁',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  'tournament-win': {
    icon: '👑',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  'jackpot-win': {
    icon: '💎',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
};

/**
 * Format relative time (e.g., "2 hours ago").
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 10) return `${seconds}s ago`;
  return 'Just now';
}

/**
 * Activity event card component.
 */
function ActivityEventCard({ event, delay = 0 }: { event: ActivityEvent; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const config = ACTIVITY_CONFIG[event.type];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      layout
      className="glass-dark-subtle p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full
            ${config.bgColor} ${config.color}
            flex items-center justify-center text-lg
            group-hover:scale-110 transition-transform
          `}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 mb-1 line-clamp-2">
            {event.message}
          </p>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(event.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ActivityFeedWidget component.
 * Displays real-time activity feed of user events.
 */
export function ActivityFeedWidget() {
  const { data, isLoading } = useDashboardData();
  const activityFeed = data?.activityFeed || [];

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📢</span> Activity Feed
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader key={i} variant="rectangular" height={60} />
          ))}
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📢</span> Activity Feed
        </h3>
        {activityFeed.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
            title="Live"
          />
        )}
      </div>

      {activityFeed.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          }
          title="No Recent Activity"
          description="Your activity will appear here as you complete missions, earn achievements, and more!"
        />
      ) : (
        <>
          {/* Activity List */}
          <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <AnimatePresence mode="popLayout">
              {activityFeed.map((event, index) => (
                <ActivityEventCard key={event.id} event={event} delay={index * 50} />
              ))}
            </AnimatePresence>
          </div>

          {/* View All Button */}
          <button className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors text-center">
            View All Activity →
          </button>
        </>
      )}

      {/* TODO: SignalR listener for activity events */}
      {/* Listen to all events: level-up, mission-complete, achievement, bonus-claim, tournament-win, jackpot-win */}
    </AnimatedCard>
  );
}
