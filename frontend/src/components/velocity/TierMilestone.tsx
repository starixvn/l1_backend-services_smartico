/**
 * TierMilestone Component
 * T035-T036: Individual milestone node in the tier journey timeline.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors, getTierXpThreshold } from '../../utils/tierColors';
import type { VelocityTier } from '../../types/velocity';

/**
 * Visual state of a milestone.
 */
export type MilestoneState = 'completed' | 'current' | 'locked';

/**
 * Props for TierMilestone component.
 */
export interface TierMilestoneProps {
  /** Tier configuration */
  tier: VelocityTier;
  /** Visual state of this milestone */
  state: MilestoneState;
  /** Whether this is the first milestone */
  isFirst?: boolean;
  /** Whether this is the last milestone */
  isLast?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Callback when milestone is clicked */
  onClick?: (tier: VelocityTier) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configuration for milestone variants.
 */
const SIZE_CONFIG = {
  sm: {
    node: 'w-10 h-10',
    icon: 'text-lg',
    text: 'text-xs',
    xpText: 'text-[10px]',
  },
  md: {
    node: 'w-14 h-14',
    icon: 'text-xl',
    text: 'text-sm',
    xpText: 'text-xs',
  },
} as const;

/**
 * Tier icon mapping.
 */
const TIER_ICONS: Record<number, string> = {
  1: '🔥',
  2: '🚀',
  3: '⚡',
  4: '💎',
};

/**
 * TierMilestone component.
 * Displays a single tier milestone with state-based styling.
 *
 * @param props - Component props
 * @returns Tier milestone element
 *
 * @example
 * ```tsx
 * <TierMilestone
 *   tier={cruiserTier}
 *   state="completed"
 *   onClick={handleMilestoneClick}
 * />
 * ```
 */
export function TierMilestone({
  tier,
  state,
  isFirst = false,
  isLast = false,
  size = 'md',
  onClick,
  className = '',
}: TierMilestoneProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(tier.tierNumber);
  const sizeConfig = SIZE_CONFIG[size];
  const isInteractive = Boolean(onClick);

  const icon = TIER_ICONS[tier.tierNumber] ?? '🎮';
  const xpRequired = getTierXpThreshold(tier.tierNumber);

  const getStateStyles = () => {
    switch (state) {
      case 'completed':
        return {
          nodeClasses: `${colors.bg} ring-2 ${colors.ring}`,
          textClasses: colors.text,
          opacity: 'opacity-100',
        };
      case 'current':
        return {
          nodeClasses: `bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo} ring-4 ${colors.ring}`,
          textClasses: 'text-white',
          opacity: 'opacity-100',
        };
      case 'locked':
      default:
        return {
          nodeClasses: 'bg-slate-700/50 ring-2 ring-slate-600/30',
          textClasses: 'text-gray-500',
          opacity: 'opacity-60',
        };
    }
  };

  const styles = getStateStyles();

  const handleClick = () => {
    if (onClick) {
      onClick(tier);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(tier);
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: tier.tierNumber * 0.1,
      }}
      className={`
        flex flex-col items-center gap-2
        ${styles.opacity}
        ${className}
      `}
    >
      {/* Milestone node */}
      <div
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative ${sizeConfig.node} rounded-full
          flex items-center justify-center
          ${styles.nodeClasses}
          transition-all duration-300
          ${isInteractive ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-4' : ''}
        `}
        aria-label={`${tier.name} tier - ${state}`}
      >
        {/* Icon */}
        <span className={sizeConfig.icon}>{icon}</span>

        {/* Current tier pulse animation */}
        {state === 'current' && !prefersReducedMotion && (
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.bg}`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Completed checkmark */}
        {state === 'completed' && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-white text-xs">✓</span>
          </div>
        )}

        {/* Locked icon */}
        {state === 'locked' && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-gray-400 text-xs">🔒</span>
          </div>
        )}
      </div>

      {/* Tier name */}
      <span
        className={`
          font-semibold uppercase tracking-wider
          ${sizeConfig.text}
          ${styles.textClasses}
        `}
      >
        {tier.name}
      </span>

      {/* XP requirement */}
      <span className={`${sizeConfig.xpText} text-gray-500`}>
        {xpRequired === 0 ? 'Start' : `${xpRequired.toLocaleString()} XP`}
      </span>
    </motion.div>
  );
}
