/**
 * TierBenefitsList Component
 * T031-T032: Displays tier benefits with unlocked vs locked styling.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';
import type { VelocityTier, TierFeature } from '../../types/velocity';

/**
 * Props for TierBenefitsList component.
 */
export interface TierBenefitsListProps {
  /** All velocity tier configurations */
  tiers: VelocityTier[];
  /** Player's current tier number */
  currentTierNumber: number;
  /** Display mode - compact shows only relevant tiers */
  displayMode?: 'full' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Icons for different feature types.
 */
const FEATURE_ICONS: Record<string, string> = {
  jackpot: '🎰',
  tournament: '🏆',
  multiplier: '✨',
  mission: '🎯',
};

/**
 * Formats feature value for display.
 */
function formatFeatureValue(feature: TierFeature): string {
  if (feature.type === 'multiplier' && feature.value) {
    return `${feature.value}x`;
  }
  return '';
}

/**
 * Single benefit item component.
 */
interface BenefitItemProps {
  feature: TierFeature;
  isUnlocked: boolean;
  tierNumber: number;
  index: number;
}

function BenefitItem({ feature, isUnlocked, tierNumber, index }: BenefitItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const colors = getTierColors(tierNumber);
  const icon = FEATURE_ICONS[feature.type] ?? '📦';
  const valueDisplay = formatFeatureValue(feature);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all
        ${isUnlocked
          ? 'bg-slate-800/50'
          : 'bg-slate-900/30 opacity-60'
        }
      `}
    >
      {/* Status icon */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUnlocked ? colors.bg : 'bg-slate-700'}
        `}
      >
        <span className="text-sm">{icon}</span>
      </div>

      {/* Benefit content */}
      <div className="flex-grow min-w-0">
        <p
          className={`
            text-sm font-medium truncate
            ${isUnlocked ? 'text-white' : 'text-gray-500'}
          `}
        >
          {feature.name}
          {valueDisplay && (
            <span className={`ml-2 ${isUnlocked ? colors.text : 'text-gray-600'}`}>
              {valueDisplay}
            </span>
          )}
        </p>
        <p className={`text-xs truncate ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {feature.description}
        </p>
      </div>

      {/* Lock/Unlock indicator */}
      <div className="flex-shrink-0">
        {isUnlocked ? (
          <span className="text-green-500 text-lg" role="img" aria-label="Unlocked">
            ✓
          </span>
        ) : (
          <span className="text-gray-600 text-lg" role="img" aria-label="Locked">
            🔒
          </span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Tier section component showing benefits for a single tier.
 */
interface TierSectionProps {
  tier: VelocityTier;
  isUnlocked: boolean;
  isCurrent: boolean;
  showHeader?: boolean;
}

function TierSection({ tier, isUnlocked, isCurrent, showHeader = true }: TierSectionProps) {
  const colors = getTierColors(tier.tierNumber);

  return (
    <div className="mb-6 last:mb-0">
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${isUnlocked ? colors.bg : 'bg-slate-700'}
              text-white
            `}
          >
            {tier.tierNumber}
          </div>
          <h4
            className={`
              font-semibold text-sm uppercase tracking-wider
              ${isUnlocked ? colors.text : 'text-gray-500'}
            `}
          >
            {tier.name}
            {isCurrent && (
              <span className="ml-2 text-xs text-green-400 normal-case tracking-normal">
                (Current)
              </span>
            )}
          </h4>
          {!isUnlocked && (
            <span className="text-xs text-gray-600 ml-auto">
              {tier.xpRequired.toLocaleString()} XP required
            </span>
          )}
        </div>
      )}

      {/* Benefits list */}
      <div className="space-y-2">
        {tier.unlockedFeatures.map((feature, index) => (
          <BenefitItem
            key={`${tier.tierNumber}-${feature.type}-${feature.name}`}
            feature={feature}
            isUnlocked={isUnlocked}
            tierNumber={tier.tierNumber}
            index={index}
          />
        ))}

        {/* Daily missions count */}
        <BenefitItem
          feature={{
            type: 'mission',
            name: 'Daily Missions',
            description: `${tier.dailyMissionCount} mission${tier.dailyMissionCount > 1 ? 's' : ''} available daily`,
          }}
          isUnlocked={isUnlocked}
          tierNumber={tier.tierNumber}
          index={tier.unlockedFeatures.length}
        />

        {/* Primary benefit */}
        {tier.benefit && (
          <div
            className={`
              mt-2 p-2 rounded-lg text-xs
              ${isUnlocked
                ? `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} bg-opacity-10`
                : 'bg-slate-900/50'
              }
            `}
            style={isUnlocked ? {
              background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}05)`,
            } : undefined}
          >
            <span className={isUnlocked ? colors.text : 'text-gray-600'}>
              ★ {tier.benefit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TierBenefitsList component.
 * Displays all tier benefits showing unlocked vs locked status.
 *
 * @param props - Component props
 * @returns Tier benefits list element
 *
 * @example
 * ```tsx
 * <TierBenefitsList
 *   tiers={velocityTiers}
 *   currentTierNumber={2}
 *   displayMode="compact"
 * />
 * ```
 */
export function TierBenefitsList({
  tiers,
  currentTierNumber,
  displayMode = 'full',
  className = '',
}: TierBenefitsListProps) {
  const prefersReducedMotion = useReducedMotion();

  // Sort tiers by tier number
  const sortedTiers = [...tiers].sort((a, b) => a.tierNumber - b.tierNumber);

  // In compact mode, show current tier and next tier only
  const displayTiers = displayMode === 'compact'
    ? sortedTiers.filter(tier =>
        tier.tierNumber === currentTierNumber ||
        tier.tierNumber === currentTierNumber + 1
      )
    : sortedTiers;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass-dark rounded-xl p-4 ${className}`}
    >
      <h3 className="text-lg font-bold text-white mb-4">
        {displayMode === 'compact' ? 'Your Benefits' : 'Tier Benefits'}
      </h3>

      {displayTiers.map(tier => (
        <TierSection
          key={tier.tierNumber}
          tier={tier}
          isUnlocked={tier.tierNumber <= currentTierNumber}
          isCurrent={tier.tierNumber === currentTierNumber}
          showHeader={displayMode === 'full' || displayTiers.length > 1}
        />
      ))}

      {/* Progress hint for non-max tier */}
      {displayMode === 'compact' && currentTierNumber < 4 && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Level up to unlock more benefits!
        </p>
      )}
    </motion.div>
  );
}
