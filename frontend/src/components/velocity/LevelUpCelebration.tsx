/**
 * LevelUpCelebration Component
 * T065-T070: Modal celebrating tier advancement with animations.
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';
import type { LevelUpEvent, TierFeature } from '../../types/velocity';

/**
 * Props for LevelUpCelebration component.
 */
export interface LevelUpCelebrationProps {
  /** Level-up event to celebrate */
  event: LevelUpEvent | null;
  /** Callback when user acknowledges */
  onAcknowledge: () => void;
  /** Whether acknowledgement is in progress */
  isAcknowledging?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tier icons mapping.
 */
const TIER_ICONS: Record<number, string> = {
  1: '🔥',
  2: '🚀',
  3: '⚡',
  4: '💎',
};

/**
 * Feature type icons.
 */
const FEATURE_ICONS: Record<string, string> = {
  jackpot: '🎰',
  tournament: '🏆',
  multiplier: '✨',
  mission: '🎯',
};

/**
 * Confetti particle component for celebration effect.
 */
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#3b82f6', '#a855f7', '#eab308', '#22c55e', '#ef4444'];
  const color = colors[index % colors.length];

  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 0.5;
  const randomDuration = 2 + Math.random() * 2;
  const randomRotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${randomX}%`,
        top: -10,
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 500],
        rotate: [0, randomRotation],
        opacity: [1, 0],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeOut',
      }}
    />
  );
}

/**
 * Confetti container with multiple particles.
 */
function Confetti() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {[...Array(50)].map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </div>
  );
}

/**
 * Tier transition animation showing old to new tier.
 */
interface TierTransitionProps {
  previousTier: number;
  previousTierName: string;
  newTier: number;
  newTierName: string;
}

function TierTransition({
  previousTier,
  previousTierName,
  newTier,
  newTierName,
}: TierTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const oldColors = getTierColors(previousTier);
  const newColors = getTierColors(newTier);

  return (
    <div className="flex items-center justify-center gap-6 my-8">
      {/* Previous tier */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0.5 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 0.8, opacity: 0.5 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${oldColors.bg} opacity-50
          `}
        >
          <span className="text-2xl">{TIER_ICONS[previousTier]}</span>
        </div>
        <p className={`mt-2 text-sm ${oldColors.text} opacity-50`}>
          {previousTierName}
        </p>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="text-3xl text-gray-400"
      >
        →
      </motion.div>

      {/* New tier */}
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="text-center"
      >
        <motion.div
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            bg-gradient-to-br ${newColors.gradientFrom} ${newColors.gradientTo}
            ring-4 ${newColors.ring}
          `}
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              `0 0 20px ${newColors.hex}40`,
              `0 0 40px ${newColors.hex}60`,
              `0 0 20px ${newColors.hex}40`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-3xl">{TIER_ICONS[newTier]}</span>
        </motion.div>
        <p className={`mt-2 text-lg font-bold ${newColors.text}`}>
          {newTierName}
        </p>
      </motion.div>
    </div>
  );
}

/**
 * New benefits list display.
 */
interface NewBenefitsProps {
  benefits: TierFeature[];
  newMissions: string[];
  tierNumber: number;
}

function NewBenefits({ benefits, newMissions, tierNumber }: NewBenefitsProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(tierNumber);

  const allBenefits = [
    ...benefits.map(b => ({
      icon: FEATURE_ICONS[b.type] ?? '📦',
      text: b.name + (b.type === 'multiplier' && b.value ? ` (${b.value}x)` : ''),
    })),
    ...newMissions.map(m => ({
      icon: '🎯',
      text: m,
    })),
  ];

  if (allBenefits.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-3 text-center">
        Newly Unlocked
      </h4>
      <div className="space-y-2">
        {allBenefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className={`
              flex items-center gap-3 p-3 rounded-lg
              bg-slate-800/50
            `}
          >
            <span className="text-lg">{benefit.icon}</span>
            <span className="text-white">{benefit.text}</span>
            <span className={`ml-auto text-xs ${colors.text}`}>NEW</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * LevelUpCelebration component.
 * Modal displaying level-up celebration with animations.
 *
 * @param props - Component props
 * @returns Level-up celebration modal element
 *
 * @example
 * ```tsx
 * <LevelUpCelebration
 *   event={levelUpEvent}
 *   onAcknowledge={handleAcknowledge}
 * />
 * ```
 */
export function LevelUpCelebration({
  event,
  onAcknowledge,
  isAcknowledging = false,
  className = '',
}: LevelUpCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const newColors = event ? getTierColors(event.newTier) : getTierColors(1);

  // T070: Focus trap and keyboard accessibility
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!event) return;

    if (e.key === 'Escape') {
      onAcknowledge();
      return;
    }

    // Focus trap
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [event, onAcknowledge]);

  // Setup keyboard listeners and focus management
  useEffect(() => {
    if (event) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the modal after animation
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    }
  }, [event, handleKeyDown]);

  const modalContent = (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onAcknowledge}
            aria-hidden="true"
          />

          {/* T067: Confetti particles */}
          <Confetti />

          {/* Modal content */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative max-w-md w-full
              glass-dark rounded-2xl p-8
              border-2 ${newColors.border}
              overflow-hidden
              ${className}
            `}
            style={{
              boxShadow: `0 0 60px ${newColors.hex}30`,
            }}
          >
            {/* Glow effect */}
            {!prefersReducedMotion && (
              <motion.div
                className={`absolute inset-0 ${newColors.bg} opacity-10`}
                animate={{
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={prefersReducedMotion ? {} : { y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-4"
              >
                <h2
                  id="level-up-title"
                  className={`text-3xl font-bold ${newColors.text}`}
                >
                  🎉 Level Up! 🎉
                </h2>
                <p className="text-gray-400 mt-2">
                  Congratulations on your advancement!
                </p>
              </motion.div>

              {/* T066: Tier transition animation */}
              <TierTransition
                previousTier={event.previousTier}
                previousTierName={event.previousTierName}
                newTier={event.newTier}
                newTierName={event.newTierName}
              />

              {/* T068: New benefits announcement */}
              <NewBenefits
                benefits={event.newBenefits}
                newMissions={event.newMissions}
                tierNumber={event.newTier}
              />

              {/* T069: Acknowledge button */}
              <motion.button
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={onAcknowledge}
                disabled={isAcknowledging}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className={`
                  w-full py-4 px-6 rounded-xl
                  bg-gradient-to-r ${newColors.gradientFrom} ${newColors.gradientTo}
                  text-white font-bold text-lg
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-4 ${newColors.ring}
                `}
              >
                {isAcknowledging ? 'Saving...' : 'Awesome! Let\'s Go!'}
              </motion.button>

              {/* Close hint */}
              <p className="text-center text-xs text-gray-500 mt-4">
                Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-gray-300">Esc</kbd> or click outside to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render to portal for proper z-index stacking
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
