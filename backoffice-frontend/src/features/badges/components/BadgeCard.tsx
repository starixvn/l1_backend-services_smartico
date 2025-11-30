import React from 'react';
import { Link } from 'react-router-dom';
import type { Badge } from '../../../services/api.types';
import { BadgeStatus, BadgeRarity, BadgeUnlockCriteriaType } from '../../../services/api.types';

interface BadgeCardProps {
  badge: Badge;
}

/**
 * Badge card component for displaying badge summary
 */
export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const getStatusColor = () => {
    switch (badge.status) {
      case BadgeStatus.ACTIVE:
        return 'bg-success text-white';
      case BadgeStatus.DRAFT:
        return 'bg-yellow-500 text-white';
      case BadgeStatus.ARCHIVED:
        return 'bg-secondary-500 text-white';
      default:
        return 'bg-secondary-300 text-secondary-800';
    }
  };

  const getRarityColor = () => {
    switch (badge.rarity) {
      case BadgeRarity.COMMON:
        return 'border-secondary-300 bg-secondary-50';
      case BadgeRarity.RARE:
        return 'border-blue-400 bg-blue-50';
      case BadgeRarity.EPIC:
        return 'border-purple-400 bg-purple-50';
      case BadgeRarity.LEGENDARY:
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-secondary-200 bg-white';
    }
  };

  const getRarityTextColor = () => {
    switch (badge.rarity) {
      case BadgeRarity.COMMON:
        return 'text-secondary-600';
      case BadgeRarity.RARE:
        return 'text-blue-600';
      case BadgeRarity.EPIC:
        return 'text-purple-600';
      case BadgeRarity.LEGENDARY:
        return 'text-yellow-600';
      default:
        return 'text-secondary-600';
    }
  };

  const getCriteriaLabel = () => {
    switch (badge.unlockCriteria.type) {
      case BadgeUnlockCriteriaType.MISSION_COMPLETED:
        return `Complete ${badge.unlockCriteria.thresholdValue || 1} mission(s)`;
      case BadgeUnlockCriteriaType.WAGER_AMOUNT:
        return `Wager $${badge.unlockCriteria.thresholdValue?.toLocaleString() || 0}`;
      case BadgeUnlockCriteriaType.DEPOSIT_AMOUNT:
        return `Deposit $${badge.unlockCriteria.thresholdValue?.toLocaleString() || 0}`;
      case BadgeUnlockCriteriaType.BET_COUNT:
        return `Place ${badge.unlockCriteria.thresholdValue?.toLocaleString() || 0} bets`;
      case BadgeUnlockCriteriaType.TOURNAMENT_WINS:
        return `Win ${badge.unlockCriteria.thresholdValue || 1} tournament(s)`;
      case BadgeUnlockCriteriaType.TOURNAMENT_PARTICIPATIONS:
        return `Join ${badge.unlockCriteria.thresholdValue || 1} tournament(s)`;
      case BadgeUnlockCriteriaType.LOGIN_STREAK:
        return `${badge.unlockCriteria.thresholdValue || 1} day login streak`;
      case BadgeUnlockCriteriaType.TOTAL_LOGINS:
        return `${badge.unlockCriteria.thresholdValue || 1} total logins`;
      case BadgeUnlockCriteriaType.LEVEL_REACHED:
        return `Reach level ${badge.unlockCriteria.thresholdValue || 1}`;
      case BadgeUnlockCriteriaType.TIER_REACHED:
        return `Reach ${badge.unlockCriteria.targetTier || 'tier'}`;
      case BadgeUnlockCriteriaType.GAME_PLAYED:
        return `Play ${badge.unlockCriteria.thresholdValue || 1} rounds`;
      case BadgeUnlockCriteriaType.FIRST_DEPOSIT:
        return 'Make first deposit';
      case BadgeUnlockCriteriaType.FIRST_BET:
        return 'Place first bet';
      case BadgeUnlockCriteriaType.CUSTOM:
        return badge.unlockCriteria.customEventName || 'Custom event';
      default:
        return 'Unknown criteria';
    }
  };

  return (
    <Link to={`/badges/${badge.id}`}>
      <div className={`border-2 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer ${getRarityColor()}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Badge Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getRarityColor()}`}>
              {badge.iconUrl ? (
                <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-2xl">🏅</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                {badge.name}
              </h3>
              <span className={`text-xs font-medium ${getRarityTextColor()}`}>
                {badge.rarity}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {badge.status}
          </span>
        </div>

        {/* Description */}
        {badge.description && (
          <p className="text-sm text-secondary-600 line-clamp-2 mb-4">
            {badge.description}
          </p>
        )}

        {/* Badge Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-secondary-500 mb-1">Unlock Criteria</p>
            <p className="text-sm font-medium text-secondary-900 truncate">
              {getCriteriaLabel()}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Unlocks</p>
            <p className="text-sm font-medium text-secondary-900">
              {badge.unlockCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-200 pt-4 mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {badge.isHidden && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                🔒 Hidden
              </span>
            )}
            {badge.progressTrackingEnabled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                📊 Progress
              </span>
            )}
          </div>
          {badge.reward && badge.reward.type !== 'None' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
              🎁 Has Reward
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
