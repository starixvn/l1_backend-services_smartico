/**
 * NextTierPreview Component
 * T042-T045: Preview card showing what unlocks at the next tier.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';
import type { VelocityTier, PlayerVelocityProgress, TierFeature } from '../../types/velocity';

/**
 * Props for NextTierPreview component.
 */
export interface NextTierPreviewProps {
  /** Player's current progress */
  progress: PlayerVelocityProgress;
  /** Next tier configuration (null if at max tier) */
  nextTier: VelocityTier | null;
  /** Callback for call-to-action button */
  onPlayNowClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Feature icons mapping.
 */
const FEATURE_ICONS: Record<string, string> = {
  jackpot: '🎰',
  tournament: '🏆',
  multiplier: '✨',
  mission: '🎯',
};

/**
 * Single preview benefit item.
 */
interface PreviewBenefitProps {
  feature: TierFeature;
  index: number;
}

function PreviewBenefit({ feature, index }: PreviewBenefitProps) {
  const prefersReducedMotion = useReducedMotion();
  const icon = FEATURE_ICONS[feature.type] ?? '📦';

  return (
    <motion.li
      initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="flex items-center gap-2 text-sm text-gray-300"
    >
      <span className="text-base">{icon}</span>
      <span>
        {feature.name}
        {feature.type === 'multiplier' && feature.value && (
          <span className="text-yellow-400 ml-1">({feature.value}x)</span>
        )}
      </span>
    </motion.li>
  );
}

/**
 * Max tier content when player has reached Supersonic.
 */
function MaxTierContent() {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(4); // Supersonic

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-6"
    >
      <motion.div
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-6xl mb-4"
      >
        🏆
      </motion.div>

      <h4 className={`text-xl font-bold ${colors.text} mb-2`}>
        Maximum Velocity Achieved!
      </h4>

      <p className="text-gray-400 text-sm max-w-xs mx-auto">
        Congratulations! You've reached the pinnacle of the Velocity Program.
        Enjoy all exclusive benefits as a Supersonic member.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <span className="text-yellow-500">4</span>
          <span className="text-gray-400 ml-1">Daily Missions</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <span className="text-yellow-500">1.5x</span>
          <span className="text-gray-400 ml-1">XP Multiplier</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <span className="text-yellow-500">VIP</span>
          <span className="text-gray-400 ml-1">Tournament Access</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <span className="text-yellow-500">All</span>
          <span className="text-gray-400 ml-1">Jackpots Unlocked</span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * NextTierPreview component.
 * Shows what benefits await at the next tier with XP progress.
 *
 * @param props - Component props
 * @returns Next tier preview element
 *
 * @example
 * ```tsx
 * <NextTierPreview
 *   progress={playerProgress}
 *   nextTier={turboTier}
 *   onPlayNowClick={handlePlayNow}
 * />
 * ```
 */
export function NextTierPreview({
  progress,
  nextTier,
  onPlayNowClick,
  className = '',
}: NextTierPreviewProps) {
  const prefersReducedMotion = useReducedMotion();

  // T045: Handle max tier state
  if (progress.isMaxTier || !nextTier) {
    return (
      <div className={`glass-dark rounded-xl p-6 ${className}`}>
        <MaxTierContent />
      </div>
    );
  }

  const colors = getTierColors(nextTier.tierNumber);
  const xpRemaining = progress.xpToNextTier ?? 0;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        glass-dark rounded-xl overflow-hidden
        border ${colors.border}
        ${className}
      `}
    >
      {/* Header with tier badge */}
      <div
        className="p-4 flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${colors.hex}20, ${colors.hex}05)`,
        }}
      >
        {/* Next tier badge */}
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center
            bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
            ring-2 ${colors.ring}
          `}
        >
          <span className="text-2xl">
            {nextTier.tierNumber === 2 && '🚀'}
            {nextTier.tierNumber === 3 && '⚡'}
            {nextTier.tierNumber === 4 && '💎'}
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Next Tier
          </p>
          <h4 className={`text-lg font-bold ${colors.text}`}>
            {nextTier.name}
          </h4>
        </div>

        {/* XP badge */}
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Need</p>
          <p className={`text-lg font-bold ${colors.text}`}>
            {xpRemaining.toLocaleString()}
            <span className="text-sm text-gray-400 ml-1">XP</span>
          </p>
        </div>
      </div>

      {/* Benefits preview */}
      <div className="p-4">
        <h5 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Unlocks at {nextTier.name}
        </h5>

        <ul className="space-y-2 mb-4">
          {nextTier.unlockedFeatures.slice(0, 3).map((feature, index) => (
            <PreviewBenefit
              key={`${feature.type}-${feature.name}`}
              feature={feature}
              index={index}
            />
          ))}

          {/* Daily missions bonus */}
          <PreviewBenefit
            feature={{
              type: 'mission',
              name: `${nextTier.dailyMissionCount} Daily Missions`,
              description: '',
            }}
            index={nextTier.unlockedFeatures.length}
          />
        </ul>

        {/* Primary benefit highlight */}
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}05)`,
          }}
        >
          <span className={colors.text}>★ </span>
          <span className="text-gray-300">{nextTier.benefit}</span>
        </div>
      </div>

      {/* Call to action */}
      {onPlayNowClick && (
        <div className="px-4 pb-4">
          <motion.button
            onClick={onPlayNowClick}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            className={`
              w-full py-3 px-4 rounded-lg
              bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}
              text-white font-semibold
              transition-all duration-200
              hover:shadow-lg hover:shadow-${colors.bg}/20
              focus:outline-none focus:ring-2 ${colors.ring}
            `}
          >
            Play Now to Level Up!
          </motion.button>
        </div>
      )}

      {/* Progress indicator */}
      <div className="px-4 pb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{progress.totalXp.toLocaleString()} XP</span>
          <span>{nextTier.xpRequired.toLocaleString()} XP</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}`}
            initial={prefersReducedMotion ? { width: `${progress.progressPercentage}%` } : { width: '0%' }}
            animate={{ width: `${progress.progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-center text-xs text-gray-500 mt-1">
          {progress.progressPercentage.toFixed(0)}% to {nextTier.name}
        </p>
      </div>
    </motion.div>
  );
}
