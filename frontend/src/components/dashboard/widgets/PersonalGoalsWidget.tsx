/**
 * PersonalGoalsWidget Component
 * Displays user's personal goals with progress tracking.
 */

import { motion } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';
import type { PersonalGoal } from '../../../types/dashboard/data';

/**
 * Personal goal card component.
 */
function PersonalGoalCard({ goal, delay = 0 }: { goal: PersonalGoal; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const isCompleted = goal.progress >= 100;

  // Format deadline
  const formatDeadline = (deadline: string | null): string => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className={`
        glass-dark-subtle p-4 rounded-lg border
        ${isCompleted ? 'border-green-500/50' : 'border-white/10'}
        hover:border-purple-500/30 transition-all group
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-base font-semibold text-white flex-1">
          {goal.name}
        </h4>
        {isCompleted && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">
            {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
          </span>
          <span className={isCompleted ? 'text-green-400 font-semibold' : 'text-gray-400'}>
            {Math.round(goal.progress)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(goal.progress, 100)}%` }}
            transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
            className="h-full relative"
            style={{
              background: isCompleted
                ? 'linear-gradient(to right, #10b981, #059669)'
                : 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
            }}
          >
            {/* Shine effect */}
            {!prefersReducedMotion && !isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </motion.div>
        </div>
      </div>

      {/* Deadline */}
      {goal.deadline && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatDeadline(goal.deadline)}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * PersonalGoalsWidget component.
 * Displays user's personal goals with progress tracking.
 */
export function PersonalGoalsWidget() {
  const { data, isLoading } = useDashboardData();
  const personalGoals = data?.personalGoals || [];
  const prefersReducedMotion = useReducedMotion();

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎯</span> Personal Goals
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" height={120} />
          ))}
        </div>
      </AnimatedCard>
    );
  }

  // Stats
  const completedGoals = personalGoals.filter((g) => g.progress >= 100).length;
  const activeGoals = personalGoals.filter((g) => g.progress < 100).length;

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎯</span> Personal Goals
        </h3>
        {personalGoals.length > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <div className="text-green-400 font-medium">
              {completedGoals} done
            </div>
            <div className="text-gray-400">
              {activeGoals} active
            </div>
          </div>
        )}
      </div>

      {personalGoals.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
          title="No Personal Goals"
          description="Set your first goal and start tracking your progress!"
          action={{
            label: 'Create Goal',
            onClick: () => {
              // TODO: Open goal creation modal
              console.log('Create goal clicked');
            },
          }}
        />
      ) : (
        <>
          {/* Goals List */}
          <div className="space-y-3 mb-4">
            {personalGoals.map((goal, index) => (
              <PersonalGoalCard key={goal.id} goal={goal} delay={index * 100} />
            ))}
          </div>

          {/* Add Goal Button */}
          <motion.button
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            className="
              w-full py-2.5 border-2 border-dashed border-gray-600 hover:border-purple-500
              text-gray-400 hover:text-purple-400
              rounded-lg text-sm font-medium
              transition-all
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
            "
          >
            + Add New Goal
          </motion.button>
        </>
      )}

      {/* TODO: SignalR listener for goal-progress event */}
      {/* TODO: SignalR listener for goal-completed event */}
    </AnimatedCard>
  );
}
