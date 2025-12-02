/**
 * XPProgressRing Component
 * T025-T028: Circular XP progress indicator with tier-specific styling.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';

/**
 * Props for XPProgressRing component.
 */
export interface XPProgressRingProps {
  /** Current XP amount */
  currentXp: number;
  /** XP required for next tier (null if max tier) */
  nextTierXp: number | null;
  /** XP threshold for current tier */
  currentTierXp: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Whether at max tier */
  isMaxTier: boolean;
  /** Current tier number (1-4) for color theming */
  tierNumber: number;
  /** Size of the ring in pixels */
  size?: number;
  /** Thickness of the ring stroke */
  thickness?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats XP numbers for display.
 * @param xp - XP value to format
 * @returns Formatted string (e.g., "1.5K", "25K")
 */
function formatXp(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(xp >= 10000 ? 0 : 1)}K`;
  }
  return xp.toLocaleString();
}

/**
 * XPProgressRing component.
 * Displays circular XP progress with animated fill and tier colors.
 *
 * @param props - Component props
 * @returns XP progress ring element
 *
 * @example
 * ```tsx
 * <XPProgressRing
 *   currentXp={3500}
 *   nextTierXp={5000}
 *   currentTierXp={500}
 *   progressPercentage={66.7}
 *   isMaxTier={false}
 *   tierNumber={2}
 * />
 * ```
 */
export function XPProgressRing({
  currentXp,
  nextTierXp,
  currentTierXp,
  progressPercentage,
  isMaxTier,
  tierNumber,
  size = 160,
  thickness = 12,
  className = '',
}: XPProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(tierNumber);

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  // Calculate SVG circle properties
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // XP to display
  const xpToNextTier = nextTierXp ? nextTierXp - currentXp : 0;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={
        isMaxTier
          ? `Maximum tier reached with ${formatXp(currentXp)} XP`
          : `${formatXp(currentXp)} of ${formatXp(nextTierXp ?? 0)} XP (${Math.round(clampedProgress)}%)`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-slate-700 opacity-30"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.hex}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={prefersReducedMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1,
            type: 'spring',
            stiffness: 60,
            damping: 15,
          }}
        />

        {/* Glow effect for high progress or max tier */}
        {(clampedProgress >= 80 || isMaxTier) && !prefersReducedMotion && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.hex}
            strokeWidth={thickness + 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            opacity={0.2}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="blur-sm"
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {isMaxTier ? (
          // T028: Max tier state (Supersonic)
          <>
            <motion.span
              className="text-3xl font-bold"
              style={{ color: colors.hex }}
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              MAX
            </motion.span>
            <span className="text-xs text-gray-400 mt-1">LEVEL</span>
            <span className="text-sm font-semibold text-white mt-2">
              {formatXp(currentXp)} XP
            </span>
          </>
        ) : (
          // Normal progress display
          <>
            {/* T027: XP numeric display */}
            <motion.span
              className="text-2xl font-bold text-white"
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              {Math.round(clampedProgress)}%
            </motion.span>

            {/* XP values */}
            <div className="mt-1 text-xs text-gray-400">
              <span className="font-semibold text-white">{formatXp(currentXp)}</span>
              <span className="mx-1">/</span>
              <span>{formatXp(nextTierXp ?? 0)}</span>
            </div>

            {/* XP remaining */}
            <span className="text-xs text-gray-500 mt-1">
              {formatXp(xpToNextTier)} to go
            </span>
          </>
        )}
      </div>
    </div>
  );
}
