/**
 * StreakTrackerWidget Component
 * Displays current login streak with fire animation and milestone tracking.
 */

import { motion } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, ProgressRing } from '../shared';

/**
 * Streak milestones configuration.
 */
const STREAK_MILESTONES = [
  { days: 7, label: '1 Week', reward: '100 points', emoji: '🔥' },
  { days: 14, label: '2 Weeks', reward: '250 points', emoji: '💪' },
  { days: 30, label: '1 Month', reward: '500 points', emoji: '⭐' },
  { days: 60, label: '2 Months', reward: '1000 points', emoji: '🌟' },
  { days: 90, label: '3 Months', reward: '2000 points', emoji: '👑' },
  { days: 365, label: '1 Year', reward: '10000 points', emoji: '🏆' },
];

/**
 * Get next milestone.
 */
function getNextMilestone(currentStreak: number) {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
}

/**
 * Get streak tier (color/emoji).
 */
function getStreakTier(streak: number): { color: string; emoji: string; label: string } {
  if (streak >= 365) return { color: 'from-yellow-400 to-orange-400', emoji: '🏆', label: 'Legendary' };
  if (streak >= 90) return { color: 'from-purple-400 to-pink-400', emoji: '👑', label: 'Epic' };
  if (streak >= 30) return { color: 'from-blue-400 to-cyan-400', emoji: '⭐', label: 'Amazing' };
  if (streak >= 14) return { color: 'from-green-400 to-emerald-400', emoji: '💪', label: 'Great' };
  if (streak >= 7) return { color: 'from-orange-400 to-red-400', emoji: '🔥', label: 'Hot' };
  return { color: 'from-gray-400 to-gray-500', emoji: '✨', label: 'Getting Started' };
}

/**
 * StreakTrackerWidget component.
 * Displays login streak with milestone tracking.
 */
export function StreakTrackerWidget() {
  const { data, isLoading } = useDashboardData();
  const streakData = data?.streakData;
  const prefersReducedMotion = useReducedMotion();

  // Loading state
  if (isLoading || !streakData) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔥</span> Daily Streak
        </h3>
        <SkeletonLoader variant="card" height={450} />
      </AnimatedCard>
    );
  }

  const tier = getStreakTier(streakData.currentStreak);
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const progressToNextMilestone = (streakData.currentStreak / nextMilestone.days) * 100;

  return (
    <AnimatedCard className="p-6 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-yellow-500/10 pointer-events-none" />

      {/* Animated Flame Effect */}
      {!prefersReducedMotion && streakData.currentStreak > 0 && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <motion.span
              animate={
                prefersReducedMotion || streakData.currentStreak === 0
                  ? {}
                  : { rotate: [0, 10, -10, 0] }
              }
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              🔥
            </motion.span>
            Daily Streak
          </h3>
          <div className="text-xs text-gray-400">
            {new Date(streakData.lastLoginDate).toLocaleDateString()}
          </div>
        </div>

        {/* Current Streak Display */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Progress Ring */}
            <ProgressRing
              progress={Math.min(progressToNextMilestone, 100)}
              size={160}
              thickness={12}
              color="url(#streak-gradient)"
              showPercentage={false}
              showGlow={streakData.currentStreak >= 7}
            />

            <svg width="0" height="0">
              <defs>
                <linearGradient id="streak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>

            {/* Streak Count in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  key={streakData.currentStreak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className={`text-5xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-1`}
                >
                  {streakData.currentStreak}
                </motion.div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  Days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Tier */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark-strong">
            <span className="text-2xl">{tier.emoji}</span>
            <span className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Streak */}
          <div className="glass-dark-subtle rounded-lg p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Current</div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
              {streakData.currentStreak}
            </div>
            <div className="text-xs text-gray-400">days</div>
          </div>

          {/* Longest Streak */}
          <div className="glass-dark-subtle rounded-lg p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">Best</div>
            <div className="text-2xl font-bold text-yellow-400">
              {streakData.longestStreak}
            </div>
            <div className="text-xs text-gray-400">days</div>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="glass-dark-strong rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Next Milestone</div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{nextMilestone.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {nextMilestone.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {nextMilestone.days} days
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Reward</div>
              <div className="text-sm font-bold text-yellow-400">
                {nextMilestone.reward}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{streakData.currentStreak} days</span>
              <span>{nextMilestone.days - streakData.currentStreak} to go</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToNextMilestone, 100)}%` }}
                transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
                className="h-full bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 relative"
              >
                {/* Shine effect */}
                {!prefersReducedMotion && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Motivation Message */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            {streakData.currentStreak === 0
              ? "Start your streak today! 🚀"
              : streakData.currentStreak < 7
              ? "Keep it up! You're building momentum! 💪"
              : streakData.currentStreak < 30
              ? "You're on fire! Don't break the streak! 🔥"
              : streakData.currentStreak < 90
              ? "Incredible dedication! Keep going! ⭐"
              : "You're a legend! Unstoppable! 👑"}
          </p>
        </div>

        {/* TODO: SignalR listener for streak-updated event */}
        {/* TODO: SignalR listener for milestone-reached event */}
      </div>
    </AnimatedCard>
  );
}
