/**
 * TierBadge Component
 * T019: Displays the velocity tier badge with rarity styling.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors, type TierColorConfig } from '../../utils/tierColors';
import type { TierRarity } from '../../types/velocity';

/**
 * Props for TierBadge component.
 */
export interface TierBadgeProps {
  /** Tier number (1-4) */
  tierNumber: number;
  /** Tier name to display */
  tierName: string;
  /** Icon URL for the tier badge */
  iconUrl?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show glow animation */
  showGlow?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configuration for badge variants.
 */
const SIZE_CONFIG = {
  sm: {
    container: 'w-12 h-12',
    icon: 'w-8 h-8',
    text: 'text-xs',
    ring: 'ring-2',
  },
  md: {
    container: 'w-16 h-16',
    icon: 'w-10 h-10',
    text: 'text-sm',
    ring: 'ring-2',
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'w-14 h-14',
    text: 'text-base',
    ring: 'ring-4',
  },
} as const;

/**
 * Fallback tier icons using Unicode symbols.
 */
const TIER_ICONS: Record<number, string> = {
  1: '🔥', // Ignition
  2: '🚀', // Cruiser
  3: '⚡', // Turbo
  4: '💎', // Supersonic
};

/**
 * TierBadge component.
 * Displays the velocity tier badge with animated rarity styling.
 *
 * @param props - Component props
 * @returns Tier badge element
 *
 * @example
 * ```tsx
 * <TierBadge tierNumber={3} tierName="Turbo" size="lg" showGlow />
 * ```
 */
export function TierBadge({
  tierNumber,
  tierName,
  iconUrl,
  size = 'md',
  showGlow = false,
  className = '',
}: TierBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(tierNumber);
  const sizeConfig = SIZE_CONFIG[size];

  const isLegendary = tierNumber === 4;

  return (
    <motion.div
      className={`relative inline-flex flex-col items-center gap-2 ${className}`}
      initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Badge container */}
      <div className="relative">
        {/* Glow effect for legendary or when showGlow is true */}
        {(showGlow || isLegendary) && !prefersReducedMotion && (
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.bg} blur-lg opacity-30`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Main badge circle */}
        <motion.div
          className={`
            relative flex items-center justify-center rounded-full
            ${sizeConfig.container}
            ${sizeConfig.ring}
            ${colors.ring}
            bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
            shadow-lg
          `}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  scale: 1.05,
                  transition: { type: 'spring', stiffness: 400, damping: 25 },
                }
          }
        >
          {/* Icon or fallback */}
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={`${tierName} tier badge`}
              className={`${sizeConfig.icon} object-contain`}
            />
          ) : (
            <span className={`${sizeConfig.icon} flex items-center justify-center text-2xl`}>
              {TIER_ICONS[tierNumber] ?? '🎮'}
            </span>
          )}
        </motion.div>

        {/* Tier number indicator */}
        <div
          className={`
            absolute -bottom-1 -right-1
            w-5 h-5 rounded-full
            flex items-center justify-center
            text-xs font-bold text-white
            ${colors.bg}
            border-2 border-slate-900
          `}
        >
          {tierNumber}
        </div>
      </div>

      {/* Tier name label */}
      <span
        className={`
          font-semibold uppercase tracking-wider
          ${sizeConfig.text}
          ${colors.text}
        `}
      >
        {tierName}
      </span>
    </motion.div>
  );
}
