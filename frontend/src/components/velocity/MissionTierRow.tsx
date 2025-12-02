/**
 * MissionTierRow Component
 * T047-T049: Single mission row with availability and completion status.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';
import type { TierMission } from '../../types/velocity';

/**
 * Props for MissionTierRow component.
 */
export interface MissionTierRowProps {
  /** Mission data */
  mission: TierMission;
  /** Player's current tier number */
  playerTier: number;
  /** Callback when mission is clicked */
  onClick?: (mission: TierMission) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reward type icons.
 */
const REWARD_ICONS: Record<string, string> = {
  free_spins: '🎰',
  cash: '💵',
  xp_boost: '⚡',
  badge: '🏅',
};

/**
 * MissionTierRow component.
 * Displays a single mission with tier requirement and completion status.
 *
 * @param props - Component props
 * @returns Mission tier row element
 *
 * @example
 * ```tsx
 * <MissionTierRow
 *   mission={dailyDriverMission}
 *   playerTier={2}
 *   onClick={handleMissionClick}
 * />
 * ```
 */
export function MissionTierRow({
  mission,
  playerTier,
  onClick,
  className = '',
}: MissionTierRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(mission.requiredTier);
  const isLocked = !mission.isAvailable;
  const isInteractive = Boolean(onClick) && mission.isAvailable;

  const handleClick = () => {
    if (onClick && mission.isAvailable) {
      onClick(mission);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(mission);
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center gap-4 p-4 rounded-lg
        transition-all duration-200
        ${isLocked
          ? 'bg-slate-900/50 opacity-60'
          : mission.isCompleted
            ? 'bg-green-900/20 border border-green-500/30'
            : 'bg-slate-800/50 hover:bg-slate-800/70'
        }
        ${isInteractive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
        ${className}
      `}
      aria-label={`${mission.name} - ${isLocked ? 'Locked' : mission.isCompleted ? 'Completed' : 'Available'}`}
    >
      {/* Tier badge */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          text-xs font-bold text-white
          ${isLocked ? 'bg-slate-700' : colors.bg}
        `}
      >
        T{mission.requiredTier}
      </div>

      {/* Mission info */}
      <div className="flex-grow min-w-0">
        <h4
          className={`
            font-semibold text-sm truncate
            ${isLocked ? 'text-gray-500' : 'text-white'}
          `}
        >
          {mission.name}
        </h4>
        <p
          className={`
            text-xs truncate
            ${isLocked ? 'text-gray-600' : 'text-gray-400'}
          `}
        >
          {mission.description}
        </p>
      </div>

      {/* Rewards */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {/* XP reward */}
        <div
          className={`
            px-2 py-1 rounded text-xs font-medium
            ${isLocked ? 'bg-slate-800 text-gray-500' : 'bg-blue-900/30 text-blue-400'}
          `}
        >
          +{mission.xpReward} XP
        </div>

        {/* Other rewards preview */}
        {mission.rewards.length > 0 && (
          <div className="flex items-center gap-1">
            {mission.rewards.slice(0, 2).map((reward, index) => (
              <span
                key={index}
                className={`text-sm ${isLocked ? 'opacity-50' : ''}`}
                title={reward.description}
              >
                {REWARD_ICONS[reward.type] ?? '🎁'}
              </span>
            ))}
            {mission.rewards.length > 2 && (
              <span className="text-xs text-gray-500">+{mission.rewards.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0 w-8 flex justify-center">
        {isLocked ? (
          <span className="text-gray-600" role="img" aria-label="Locked">
            🔒
          </span>
        ) : mission.isCompleted ? (
          <motion.span
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-500 text-lg"
            role="img"
            aria-label="Completed"
          >
            ✓
          </motion.span>
        ) : (
          <span className={`w-3 h-3 rounded-full ${colors.bg} animate-pulse`} />
        )}
      </div>
    </motion.div>
  );
}
