/**
 * RewardCalendarWidget Component
 * Displays monthly calendar with daily login rewards.
 */

import { motion } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';
import type { CalendarDay } from '../../../types/dashboard/data';

/**
 * Reward type icons.
 */
const REWARD_ICONS: Record<'points' | 'gems' | 'bonus', string> = {
  points: '⭐',
  gems: '💎',
  bonus: '🎁',
};

/**
 * Reward type colors.
 */
const REWARD_COLORS: Record<'points' | 'gems' | 'bonus', string> = {
  points: 'from-yellow-600 to-orange-600',
  gems: 'from-blue-600 to-purple-600',
  bonus: 'from-pink-600 to-rose-600',
};

/**
 * Calendar day cell component.
 */
function CalendarDayCell({ day }: { day: CalendarDay }) {
  const prefersReducedMotion = useReducedMotion();
  const isPast = new Date(day.date) < new Date(new Date().toISOString().split('T')[0]);
  const isFuture = new Date(day.date) > new Date(new Date().toISOString().split('T')[0]);

  return (
    <motion.div
      whileHover={
        prefersReducedMotion || !day.isToday
          ? undefined
          : { scale: 1.05 }
      }
      className={`
        aspect-square rounded-lg p-2 flex flex-col items-center justify-center
        transition-all relative
        ${
          day.isToday
            ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-600/20 to-pink-600/20'
            : day.isCompleted
            ? 'bg-green-500/10 border border-green-500/30'
            : isFuture
            ? 'bg-slate-800/30 border border-slate-700/30'
            : 'bg-slate-800/50 border border-slate-600/30 opacity-60'
        }
      `}
    >
      {/* Day Number */}
      <div
        className={`
          text-xs font-semibold mb-1
          ${
            day.isToday
              ? 'text-purple-300'
              : day.isCompleted
              ? 'text-green-400'
              : isFuture
              ? 'text-gray-400'
              : 'text-gray-500'
          }
        `}
      >
        {new Date(day.date).getDate()}
      </div>

      {/* Reward or Status */}
      {day.isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-lg"
        >
          ✓
        </motion.div>
      )}

      {day.reward && !day.isCompleted && (
        <div className="text-center">
          <div className="text-lg mb-0.5">{REWARD_ICONS[day.reward.type]}</div>
          <div className="text-[10px] font-bold text-white">
            {day.reward.value}
          </div>
        </div>
      )}

      {/* Today Indicator */}
      {day.isToday && !day.isCompleted && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500"
        />
      )}
    </motion.div>
  );
}

/**
 * RewardCalendarWidget component.
 * Displays monthly calendar with daily login rewards.
 */
export function RewardCalendarWidget() {
  const { data, isLoading } = useDashboardData();
  const rewardCalendar = data?.rewardCalendar || [];
  const prefersReducedMotion = useReducedMotion();

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📅</span> Daily Rewards
        </h3>
        <SkeletonLoader variant="card" height={350} />
      </AnimatedCard>
    );
  }

  // No calendar data
  if (rewardCalendar.length === 0) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📅</span> Daily Rewards
        </h3>
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          title="No Reward Calendar"
          description="Daily reward calendar coming soon!"
        />
      </AnimatedCard>
    );
  }

  // Stats
  const completedDays = rewardCalendar.filter((d) => d.isCompleted).length;
  const totalDays = rewardCalendar.length;
  const todayReward = rewardCalendar.find((d) => d.isToday)?.reward;

  // Get current month name
  const currentMonth = new Date(rewardCalendar[0]?.date || new Date()).toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });

  // Days of week header
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📅</span> Daily Rewards
        </h3>
        <div className="text-sm text-gray-400">
          {completedDays} / {totalDays} days
        </div>
      </div>

      {/* Month Title */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-white">{currentMonth}</h4>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {rewardCalendar.map((day) => (
            <CalendarDayCell key={day.date} day={day} />
          ))}
        </div>
      </div>

      {/* Today's Reward */}
      {todayReward && (
        <div className="glass-dark-strong rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Today's Reward</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{REWARD_ICONS[todayReward.type]}</span>
                <span className="text-lg font-bold text-white">
                  {todayReward.value.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 capitalize">
                  {todayReward.type}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
              style={{
                background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              Claim
            </motion.button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Monthly Progress</span>
          <span>{Math.round((completedDays / totalDays) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedDays / totalDays) * 100}%` }}
            transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
            className="h-full relative"
            style={{
              background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
            }}
          >
            {/* Shine effect */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
            <span>Claimed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-2 ring-purple-500 bg-purple-600/20" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-800/30 border border-slate-700/30" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      {/* TODO: SignalR listener for daily-reward-claimed event */}
    </AnimatedCard>
  );
}
