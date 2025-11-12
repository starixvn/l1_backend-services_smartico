/**
 * ProgressRing Component
 * Circular progress indicator with spring animations and glow effects.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { ProgressRingProps } from '../../../types/dashboard/components';

/**
 * ProgressRing component.
 * Displays circular progress with SVG and Framer Motion animations.
 *
 * @param props - Component props
 * @returns Circular progress ring
 */
export function ProgressRing({
  progress,
  size = 120,
  thickness = 8,
  color = '#a855f7',
  backgroundColor = '#334155',
  showPercentage = true,
  showGlow = false,
  label,
  className = '',
}: ProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Calculate SVG circle properties
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const isComplete = clampedProgress >= 100;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        role="img"
        aria-label={`Progress: ${clampedProgress}%`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
          opacity={0.3}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={prefersReducedMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
            type: 'spring',
            stiffness: 80,
            damping: 15,
          }}
          style={{
            filter: showGlow && isComplete ? 'drop-shadow(0 0 8px currentColor)' : undefined,
          }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />

        {/* Glow effect for 100% completion */}
        {showGlow && isComplete && !prefersReducedMotion && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness + 2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            opacity={0.3}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
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
        )}
        {label && (
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
