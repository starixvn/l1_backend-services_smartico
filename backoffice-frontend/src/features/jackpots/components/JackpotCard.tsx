import React from 'react';
import { Link } from 'react-router-dom';
import type { Jackpot, JackpotTier } from '../../../services/api.types';
import { JackpotStatus, JackpotType, JackpotTriggerType } from '../../../services/api.types';

interface JackpotCardProps {
  jackpot: Jackpot;
}

/**
 * Jackpot card component for displaying jackpot summary
 */
export const JackpotCard: React.FC<JackpotCardProps> = ({ jackpot }) => {
  const getStatusColor = () => {
    switch (jackpot.status) {
      case JackpotStatus.ACTIVE:
        return 'bg-success text-white';
      case JackpotStatus.DRAFT:
        return 'bg-yellow-500 text-white';
      case JackpotStatus.PAUSED:
        return 'bg-orange-500 text-white';
      case JackpotStatus.COMPLETED:
        return 'bg-blue-500 text-white';
      case JackpotStatus.ARCHIVED:
        return 'bg-secondary-500 text-white';
      default:
        return 'bg-secondary-300 text-secondary-800';
    }
  };

  const getTierColor = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('grand') || name.includes('mega')) {
      return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    }
    if (name.includes('major')) {
      return 'border-purple-500 bg-purple-50 text-purple-700';
    }
    if (name.includes('minor')) {
      return 'border-blue-500 bg-blue-50 text-blue-700';
    }
    if (name.includes('mini')) {
      return 'border-secondary-400 bg-secondary-50 text-secondary-700';
    }
    return 'border-secondary-300 bg-secondary-50 text-secondary-700';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: jackpot.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getTotalCurrentValue = () => {
    return jackpot.tiers.reduce((sum, tier) => sum + tier.currentValue, 0);
  };

  const getTriggerLabel = (tier: JackpotTier) => {
    switch (tier.triggerCondition.triggerType) {
      case JackpotTriggerType.RANDOM:
        const prob = tier.triggerCondition.probability || 0;
        return `${(prob * 100).toFixed(4)}% chance`;
      case JackpotTriggerType.VALUE_BASED:
        return `Bet ${formatCurrency(tier.triggerCondition.betThreshold || 0)}+`;
      case JackpotTriggerType.TIME_BASED:
        return `${tier.triggerCondition.timeInterval || 'Scheduled'} drop`;
      default:
        return 'Unknown';
    }
  };

  // Sort tiers by display order (Grand first = highest)
  const sortedTiers = [...jackpot.tiers].sort((a, b) => b.displayOrder - a.displayOrder);

  return (
    <Link to={`/jackpots/${jackpot.id}`}>
      <div className="border border-secondary-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">
              {jackpot.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${jackpot.type === JackpotType.PROGRESSIVE ? 'text-success' : 'text-blue-600'}`}>
                {jackpot.type}
              </span>
              <span className="text-secondary-400">|</span>
              <span className="text-xs text-secondary-500">
                {jackpot.tiers.length} tier{jackpot.tiers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {jackpot.status}
          </span>
        </div>

        {/* Total Value */}
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
          <p className="text-xs text-primary-600 mb-1">Total Jackpot Value</p>
          <p className="text-2xl font-bold text-primary-700">
            {formatCurrency(getTotalCurrentValue())}
          </p>
        </div>

        {/* Tiers */}
        <div className="space-y-2 mb-4">
          {sortedTiers.slice(0, 4).map((tier) => (
            <div
              key={tier.tierId}
              className={`flex items-center justify-between p-2 rounded border ${getTierColor(tier.tierName)}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{tier.tierName}</span>
                <span className="text-xs opacity-75">
                  {getTriggerLabel(tier)}
                </span>
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(tier.currentValue)}
              </span>
            </div>
          ))}
          {jackpot.tiers.length > 4 && (
            <p className="text-xs text-secondary-500 text-center">
              +{jackpot.tiers.length - 4} more tier(s)
            </p>
          )}
        </div>

        {/* Description */}
        {jackpot.description && (
          <p className="text-sm text-secondary-600 line-clamp-2 mb-4">
            {jackpot.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-secondary-500 mb-1">Total Contributions</p>
            <p className="text-sm font-medium text-secondary-900">
              {formatCurrency(jackpot.totalContributions)}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Total Payouts</p>
            <p className="text-sm font-medium text-secondary-900">
              {formatCurrency(jackpot.totalPayouts)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-200 pt-4 mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-secondary-500">
            {jackpot.eligibleGames.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                {jackpot.eligibleGames.length} game{jackpot.eligibleGames.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {jackpot.lastWonAt && (
            <span className="text-xs text-secondary-500">
              Last won: {new Date(jackpot.lastWonAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
