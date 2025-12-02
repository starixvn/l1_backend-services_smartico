/**
 * VelocityTierCard Component
 * T021-T023, T030, T034: Hero status card displaying tier and XP progress.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors, getTierCardClasses } from '../../utils/tierColors';
import { TierBadge } from './TierBadge';
import { XPProgressRing } from './XPProgressRing';
import type { PlayerVelocityProgress, VelocityTier } from '../../types/velocity';

/**
 * Props for VelocityTierCard component.
 */
export interface VelocityTierCardProps {
  /** Player's velocity progress data */
  progress: PlayerVelocityProgress;
  /** Current tier configuration */
  currentTier?: VelocityTier;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats a date string to relative time or short date.
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
function formatTierDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * VelocityTierCard component.
 * Displays the player's current velocity tier with XP progress.
 *
 * @param props - Component props
 * @returns Hero status card element
 *
 * @example
 * ```tsx
 * <VelocityTierCard progress={playerProgress} currentTier={tierConfig} />
 * ```
 */
export function VelocityTierCard({
  progress,
  currentTier,
  className = '',
}: VelocityTierCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(progress.currentTier);
  const cardClasses = getTierCardClasses(progress.currentTier);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={`
        glass-dark rounded-xl border p-6 transition-all duration-300
        ${cardClasses}
        ${className}
      `}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Left side: Tier Badge */}
        <div className="flex-shrink-0">
          <TierBadge
            tierNumber={progress.currentTier}
            tierName={progress.currentTierName}
            iconUrl={currentTier?.iconUrl}
            size="lg"
            showGlow={progress.isMaxTier}
          />
        </div>

        {/* Center: Progress Ring */}
        <div className="flex-shrink-0">
          <XPProgressRing
            currentXp={progress.totalXp}
            nextTierXp={progress.nextTierXpThreshold}
            currentTierXp={progress.currentTierXpThreshold}
            progressPercentage={progress.progressPercentage}
            isMaxTier={progress.isMaxTier}
            tierNumber={progress.currentTier}
            size={140}
            thickness={10}
          />
        </div>

        {/* Right side: Tier Info */}
        <div className="flex-grow text-center lg:text-left">
          {/* Tier title */}
          <h2 className="text-2xl font-bold text-white mb-1">
            {progress.currentTierName} Tier
          </h2>

          {/* Status indicator */}
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
            <span
              className={`inline-block w-2 h-2 rounded-full ${colors.bg} animate-pulse`}
            />
            <span className="text-sm text-gray-400">
              {progress.isMaxTier ? 'Maximum Level Achieved' : 'Active'}
            </span>
          </div>

          {/* T023: Tier achievement date */}
          <p className="text-sm text-gray-500 mb-4">
            Member since{' '}
            <span className="text-gray-300">
              {formatTierDate(progress.tierAchievedAt)}
            </span>
          </p>

          {/* XP Breakdown summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                From Slots
              </p>
              <p className="text-white font-semibold">
                {progress.xpBreakdown.slots.toLocaleString()} XP
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                From Tables
              </p>
              <p className="text-white font-semibold">
                {progress.xpBreakdown.tableGames.toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* Progress message */}
          {!progress.isMaxTier && progress.xpToNextTier && (
            <motion.p
              className="mt-4 text-sm"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-gray-400">Only </span>
              <span className={`font-bold ${colors.text}`}>
                {progress.xpToNextTier.toLocaleString()} XP
              </span>
              <span className="text-gray-400"> to reach the next tier!</span>
            </motion.p>
          )}

          {progress.isMaxTier && (
            <motion.p
              className="mt-4 text-sm text-yellow-400 font-medium"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              You've reached the pinnacle of the Velocity Program!
            </motion.p>
          )}
        </div>
      </div>

      {/* Current tier benefit highlight */}
      {currentTier && (
        <motion.div
          className={`
            mt-6 p-4 rounded-lg
            bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}
            bg-opacity-10
          `}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}05)`,
          }}
        >
          <p className="text-sm">
            <span className="font-semibold" style={{ color: colors.hex }}>
              Tier Benefit:
            </span>
            <span className="text-gray-300 ml-2">{currentTier.benefit}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
