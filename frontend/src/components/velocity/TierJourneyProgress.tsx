/**
 * TierJourneyProgress Component
 * T038-T040: Horizontal/vertical tier timeline showing progression.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';
import { TierMilestone, type MilestoneState } from './TierMilestone';
import type { VelocityTier, PlayerVelocityProgress } from '../../types/velocity';

/**
 * Props for TierJourneyProgress component.
 */
export interface TierJourneyProgressProps {
  /** All velocity tier configurations */
  tiers: VelocityTier[];
  /** Player's current progress */
  progress: PlayerVelocityProgress;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md';
  /** Callback when a milestone is clicked */
  onMilestoneClick?: (tier: VelocityTier) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Connecting line between milestones.
 */
interface ConnectionLineProps {
  fromTier: number;
  toTier: number;
  currentTier: number;
  progressPercentage: number;
  orientation: 'horizontal' | 'vertical';
}

function ConnectionLine({
  fromTier,
  toTier,
  currentTier,
  progressPercentage,
  orientation,
}: ConnectionLineProps) {
  const prefersReducedMotion = useReducedMotion();
  const fromColors = getTierColors(fromTier);
  const toColors = getTierColors(toTier);

  // Determine fill percentage for this segment
  const isCompleted = currentTier > fromTier;
  const isActive = currentTier === fromTier;
  const fillPercentage = isCompleted ? 100 : isActive ? progressPercentage : 0;

  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={`
        relative
        ${isHorizontal ? 'flex-1 h-1 min-w-[40px]' : 'w-1 h-12 mx-auto'}
      `}
    >
      {/* Background line */}
      <div
        className={`
          absolute bg-slate-700/50 rounded-full
          ${isHorizontal ? 'inset-x-0 top-1/2 -translate-y-1/2 h-1' : 'inset-y-0 left-1/2 -translate-x-1/2 w-1'}
        `}
      />

      {/* Filled progress line */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: `linear-gradient(${isHorizontal ? 'to right' : 'to bottom'}, ${fromColors.hex}, ${toColors.hex})`,
          ...(isHorizontal
            ? { left: 0, top: '50%', transform: 'translateY(-50%)', height: '4px' }
            : { top: 0, left: '50%', transform: 'translateX(-50%)', width: '4px' }
          ),
        }}
        initial={prefersReducedMotion ? { [isHorizontal ? 'width' : 'height']: `${fillPercentage}%` } : { [isHorizontal ? 'width' : 'height']: '0%' }}
        animate={{ [isHorizontal ? 'width' : 'height']: `${fillPercentage}%` }}
        transition={{ duration: 0.8, delay: fromTier * 0.2, ease: 'easeOut' }}
      />
    </div>
  );
}

/**
 * Determines the milestone state based on player progress.
 */
function getMilestoneState(tierNumber: number, currentTier: number): MilestoneState {
  if (tierNumber < currentTier) return 'completed';
  if (tierNumber === currentTier) return 'current';
  return 'locked';
}

/**
 * TierJourneyProgress component.
 * Displays the tier progression timeline with milestone nodes and connecting lines.
 *
 * @param props - Component props
 * @returns Tier journey progress element
 *
 * @example
 * ```tsx
 * <TierJourneyProgress
 *   tiers={velocityTiers}
 *   progress={playerProgress}
 *   orientation="horizontal"
 *   onMilestoneClick={handleTierSelect}
 * />
 * ```
 */
export function TierJourneyProgress({
  tiers,
  progress,
  orientation = 'horizontal',
  size = 'md',
  onMilestoneClick,
  className = '',
}: TierJourneyProgressProps) {
  const prefersReducedMotion = useReducedMotion();

  // Sort tiers by tier number
  const sortedTiers = [...tiers].sort((a, b) => a.tierNumber - b.tierNumber);

  const isHorizontal = orientation === 'horizontal';

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        glass-dark rounded-xl p-6
        ${className}
      `}
      role="region"
      aria-label="Tier progression timeline"
    >
      <h3 className="text-lg font-bold text-white mb-6 text-center">
        Your Velocity Journey
      </h3>

      <div
        className={`
          flex items-center
          ${isHorizontal
            ? 'flex-row justify-between gap-2'
            : 'flex-col gap-4'
          }
        `}
      >
        {sortedTiers.map((tier, index) => {
          const state = getMilestoneState(tier.tierNumber, progress.currentTier);
          const isFirst = index === 0;
          const isLast = index === sortedTiers.length - 1;
          const nextTier = sortedTiers[index + 1];

          return (
            <div
              key={tier.tierNumber}
              className={`
                flex items-center
                ${isHorizontal ? 'flex-row' : 'flex-col'}
                ${isLast ? '' : 'flex-1'}
              `}
            >
              <TierMilestone
                tier={tier}
                state={state}
                isFirst={isFirst}
                isLast={isLast}
                size={size}
                onClick={onMilestoneClick}
              />

              {/* Connection line to next tier */}
              {!isLast && nextTier && (
                <ConnectionLine
                  fromTier={tier.tierNumber}
                  toTier={nextTier.tierNumber}
                  currentTier={progress.currentTier}
                  progressPercentage={progress.progressPercentage}
                  orientation={orientation}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="mt-6 text-center">
        {progress.isMaxTier ? (
          <motion.p
            className="text-yellow-400 font-medium"
            initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🏆 You've reached the top! Maximum velocity achieved!
          </motion.p>
        ) : (
          <p className="text-sm text-gray-400">
            <span className="text-white font-semibold">
              {progress.totalXp.toLocaleString()}
            </span>
            {' '}XP earned •{' '}
            <span className={getTierColors(progress.currentTier + 1).text}>
              {progress.xpToNextTier?.toLocaleString() ?? 0}
            </span>
            {' '}to next tier
          </p>
        )}
      </div>
    </motion.div>
  );
}
