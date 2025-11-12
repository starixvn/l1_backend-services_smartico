/**
 * VIPStatusWidget Component
 * Displays VIP tier status with benefits and progress to next tier.
 */

import { motion } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, ProgressRing } from '../shared';
import type { VIPStatus } from '../../../types/dashboard/data';

/**
 * VIP tier configuration.
 */
const VIP_TIERS: Record<
  VIPStatus['tier'],
  {
    color: string;
    gradient: string;
    gradientStart: string;
    gradientEnd: string;
    emoji: string;
    label: string;
    maxPoints: number
  }
> = {
  bronze: {
    color: 'text-orange-700',
    gradient: 'from-orange-700 to-orange-900',
    gradientStart: '#c2410c',
    gradientEnd: '#7c2d12',
    emoji: '🥉',
    label: 'Bronze',
    maxPoints: 1000,
  },
  silver: {
    color: 'text-gray-400',
    gradient: 'from-gray-400 to-gray-600',
    gradientStart: '#9ca3af',
    gradientEnd: '#4b5563',
    emoji: '🥈',
    label: 'Silver',
    maxPoints: 5000,
  },
  gold: {
    color: 'text-yellow-400',
    gradient: 'from-yellow-400 to-yellow-600',
    gradientStart: '#facc15',
    gradientEnd: '#ca8a04',
    emoji: '🥇',
    label: 'Gold',
    maxPoints: 15000,
  },
  platinum: {
    color: 'text-cyan-400',
    gradient: 'from-cyan-400 to-blue-500',
    gradientStart: '#22d3ee',
    gradientEnd: '#3b82f6',
    emoji: '💎',
    label: 'Platinum',
    maxPoints: 50000,
  },
  diamond: {
    color: 'text-purple-400',
    gradient: 'from-purple-400 to-pink-500',
    gradientStart: '#c084fc',
    gradientEnd: '#ec4899',
    emoji: '👑',
    label: 'Diamond',
    maxPoints: Infinity,
  },
};

/**
 * Get tier index for progress calculation.
 */
function getTierIndex(tier: VIPStatus['tier']): number {
  const tiers: VIPStatus['tier'][] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  return tiers.indexOf(tier);
}

/**
 * VIPStatusWidget component.
 * Displays VIP tier with benefits and progress.
 */
export function VIPStatusWidget() {
  const { data, isLoading } = useDashboardData();
  const vipStatus = data?.vipStatus;
  const prefersReducedMotion = useReducedMotion();

  // Loading state
  if (isLoading || !vipStatus) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>👑</span> VIP Status
        </h3>
        <SkeletonLoader variant="card" height={400} />
      </AnimatedCard>
    );
  }

  const currentTier = VIP_TIERS[vipStatus.tier];
  const tierIndex = getTierIndex(vipStatus.tier);
  const nextTierKey = (['silver', 'gold', 'platinum', 'diamond'] as const)[tierIndex];
  const nextTier = nextTierKey ? VIP_TIERS[nextTierKey] : null;

  // Calculate progress to next tier
  const totalPointsNeeded = nextTier ? nextTier.maxPoints - currentTier.maxPoints : 0;
  const currentProgress = nextTier
    ? totalPointsNeeded > 0
      ? ((totalPointsNeeded - vipStatus.pointsToNextTier) / totalPointsNeeded) * 100
      : 100
    : 100;

  const isMaxTier = vipStatus.tier === 'diamond';

  return (
    <AnimatedCard className="p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTier.gradient} opacity-10 pointer-events-none`} />

      {/* Glowing Effect */}
      {!prefersReducedMotion && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br ${currentTier.gradient} opacity-20 rounded-full blur-3xl pointer-events-none`}
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👑</span> VIP Status
          </h3>
          <motion.div
            animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-3xl"
          >
            {currentTier.emoji}
          </motion.div>
        </div>

        {/* Current Tier Display */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Progress Ring */}
            {!isMaxTier && (
              <>
                <ProgressRing
                  progress={currentProgress}
                  size={140}
                  thickness={10}
                  color="url(#vip-gradient)"
                  showPercentage={false}
                  showGlow={currentProgress > 80}
                />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="vip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={currentTier.gradientStart} />
                      <stop offset="100%" stopColor={currentTier.gradientEnd} />
                    </linearGradient>
                  </defs>
                </svg>
              </>
            )}

            {/* Tier Badge in Center */}
            <div className={isMaxTier ? '' : 'absolute inset-0 flex items-center justify-center'}>
              <div className="text-center">
                <div className="text-4xl mb-2">{currentTier.emoji}</div>
                <div className={`text-xl font-bold bg-gradient-to-r ${currentTier.gradient} bg-clip-text text-transparent`}>
                  {currentTier.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">VIP Tier</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {!isMaxTier && nextTier && (
          <div className="glass-dark-strong rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Next Tier</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{nextTier.emoji}</span>
                  <span className={`text-base font-bold bg-gradient-to-r ${nextTier.gradient} bg-clip-text text-transparent`}>
                    {nextTier.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Points Needed</div>
                <div className="text-lg font-bold text-white">
                  {vipStatus.pointsToNextTier.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{Math.round(currentProgress)}% complete</span>
                <span>{nextTier.label} VIP</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
                  className={`h-full bg-gradient-to-r ${nextTier.gradient} relative`}
                >
                  {/* Shine effect */}
                  {!prefersReducedMotion && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* VIP Benefits */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h4 className="text-sm font-semibold text-white">Your Benefits</h4>
          </div>

          <div className="space-y-2">
            {vipStatus.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Max Tier Badge */}
        {isMaxTier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center glass-dark-strong rounded-lg p-4"
          >
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-base font-bold text-white mb-1">
              Maximum VIP Tier Reached!
            </div>
            <p className="text-xs text-gray-400">
              You've achieved the highest VIP status. Enjoy all exclusive benefits!
            </p>
          </motion.div>
        )}

        {/* TODO: SignalR listener for vip-tier-upgrade event */}
        {/* TODO: SignalR listener for vip-points-earned event */}
      </div>
    </AnimatedCard>
  );
}
