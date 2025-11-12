/**
 * AnimatedCard Component
 * Glassmorphism wrapper with entrance animations and hover effects.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { AnimatedCardProps, Rarity } from '../../../types/dashboard/components';

/**
 * Rarity color variants for card borders.
 */
const RARITY_COLORS: Record<Rarity, string> = {
  common: 'border-gray-500/30 hover:border-gray-500',
  rare: 'border-blue-500/30 hover:border-blue-500',
  epic: 'border-purple-500/30 hover:border-purple-500',
  legendary: 'border-yellow-500/30 hover:border-yellow-500',
  mythic: 'border-pink-500/30 hover:border-pink-500',
};

/**
 * AnimatedCard component.
 * Provides glassmorphism card wrapper with Framer Motion animations.
 *
 * @param props - Component props
 * @returns Animated glassmorphism card
 */
export function AnimatedCard({
  children,
  className = '',
  rarity = 'common',
  onClick,
  delay = 0,
  isInteractive = false,
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const rarityClasses = RARITY_COLORS[rarity];
  const interactiveClasses = isInteractive || onClick
    ? 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]'
    : '';

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay / 1000,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileHover={
        prefersReducedMotion || !isInteractive
          ? undefined
          : {
              scale: 1.02,
              y: -4,
              transition: { duration: 0.2, type: 'spring', stiffness: 400, damping: 25 },
            }
      }
      whileTap={
        prefersReducedMotion || !isInteractive
          ? undefined
          : {
              scale: 0.95,
              transition: { duration: 0.1 },
            }
      }
      onClick={onClick}
      className={`
        glass-dark rounded-xl border transition-all duration-300
        will-change-transform
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
        ${rarityClasses}
        ${interactiveClasses}
        ${className}
      `}
      style={{
        transform: 'translateZ(0)', // GPU acceleration
      }}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? 'Interactive card' : undefined}
    >
      {children}
    </motion.div>
  );
}
