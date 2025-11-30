import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { badgeApi } from '../../../services/badgeApi';
import type { Badge } from '../../../services/api.types';
import { BadgeStatus, BadgeRarity, BadgeUnlockCriteriaType, BadgeRewardType } from '../../../services/api.types';

/**
 * Badge details page
 */
export const BadgeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBadge(id);
    }
  }, [id]);

  const loadBadge = async (badgeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await badgeApi.getBadgeById(badgeId);
      setBadge(data);
    } catch (err) {
      console.error('Error loading badge:', err);
      setError('Failed to load badge');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await badgeApi.publishBadge(id);
      await loadBadge(id);
    } catch (err) {
      console.error('Error publishing badge:', err);
      setError('Failed to publish badge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await badgeApi.archiveBadge(id);
      await loadBadge(id);
    } catch (err) {
      console.error('Error archiving badge:', err);
      setError('Failed to archive badge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !badge) return;
    if (!confirm('Are you sure you want to delete this badge? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(true);
      await badgeApi.deleteBadge(id);
      navigate('/badges');
    } catch (err) {
      console.error('Error deleting badge:', err);
      setError('Failed to delete badge. Only draft badges can be deleted.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRarityColor = () => {
    switch (badge?.rarity) {
      case BadgeRarity.COMMON:
        return 'border-secondary-300 bg-secondary-50 text-secondary-600';
      case BadgeRarity.RARE:
        return 'border-blue-400 bg-blue-50 text-blue-600';
      case BadgeRarity.EPIC:
        return 'border-purple-400 bg-purple-50 text-purple-600';
      case BadgeRarity.LEGENDARY:
        return 'border-yellow-500 bg-yellow-50 text-yellow-600';
      default:
        return 'border-secondary-200 bg-white text-secondary-600';
    }
  };

  const getStatusColor = () => {
    switch (badge?.status) {
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

  const getCriteriaLabel = () => {
    if (!badge) return '';
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

  const getRewardLabel = () => {
    if (!badge?.reward || badge.reward.type === BadgeRewardType.NONE) return 'None';
    switch (badge.reward.type) {
      case BadgeRewardType.XP_BOOST:
        return `${badge.reward.value}x XP for ${badge.reward.durationHours} hours`;
      case BadgeRewardType.FREE_SPINS:
        return `${badge.reward.value} Free Spins`;
      case BadgeRewardType.CASH:
        return `$${badge.reward.value} Cash`;
      case BadgeRewardType.BONUS_TEMPLATE:
        return 'Bonus Template';
      default:
        return 'Unknown reward';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !badge) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error || 'Badge not found'}</p>
        <Link to="/badges" className="text-primary-600 hover:underline">
          Back to Badges
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
            <Link to="/badges" className="hover:text-primary-600">Badges</Link>
            <span>/</span>
            <span className="text-secondary-900">{badge.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${getRarityColor()}`}>
              {badge.iconUrl ? (
                <img src={badge.iconUrl} alt={badge.name} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-3xl">🏅</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">{badge.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {badge.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRarityColor()}`}>
                  {badge.rarity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {badge.status === BadgeStatus.DRAFT && (
            <>
              <Link
                to={`/badges/${id}/edit`}
                className="px-4 py-2 text-secondary-700 font-medium border border-secondary-300 rounded-md hover:bg-secondary-50 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="px-4 py-2 bg-success text-white font-medium rounded-md hover:bg-success-dark disabled:opacity-50 transition-colors"
              >
                Publish
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-error font-medium border border-error rounded-md hover:bg-error-light disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            </>
          )}
          {badge.status === BadgeStatus.ACTIVE && (
            <button
              onClick={handleArchive}
              disabled={actionLoading}
              className="px-4 py-2 text-secondary-700 font-medium border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 transition-colors"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {badge.description && (
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <p className="text-secondary-700">{badge.description}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unlock Criteria */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Unlock Criteria</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-500">Type</p>
              <p className="font-medium text-secondary-900">{badge.unlockCriteria.type}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Requirement</p>
              <p className="font-medium text-secondary-900">{getCriteriaLabel()}</p>
            </div>
            {badge.unlockCriteria.eligibleGames && badge.unlockCriteria.eligibleGames.length > 0 && (
              <div>
                <p className="text-sm text-secondary-500">Eligible Games</p>
                <p className="font-medium text-secondary-900">
                  {badge.unlockCriteria.eligibleGames.join(', ')}
                </p>
              </div>
            )}
            {badge.unlockCriteria.description && (
              <div>
                <p className="text-sm text-secondary-500">Custom Description</p>
                <p className="text-secondary-700">{badge.unlockCriteria.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reward */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Reward</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-500">Type</p>
              <p className="font-medium text-secondary-900">
                {badge.reward?.type || 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Value</p>
              <p className="font-medium text-secondary-900">{getRewardLabel()}</p>
            </div>
            {badge.reward?.description && (
              <div>
                <p className="text-sm text-secondary-500">Description</p>
                <p className="text-secondary-700">{badge.reward.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Statistics</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary-500">Total Unlocks</p>
              <p className="text-3xl font-bold text-secondary-900">{badge.unlockCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Settings</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${badge.isHidden ? 'bg-yellow-500' : 'bg-secondary-300'}`}></span>
              <span className="text-secondary-700">
                {badge.isHidden ? 'Hidden Badge' : 'Visible to Players'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${badge.progressTrackingEnabled ? 'bg-success' : 'bg-secondary-300'}`}></span>
              <span className="text-secondary-700">
                {badge.progressTrackingEnabled ? 'Progress Tracking Enabled' : 'No Progress Tracking'}
              </span>
            </div>
            {badge.seriesId && (
              <div>
                <p className="text-sm text-secondary-500">Series</p>
                <p className="font-medium text-secondary-900">
                  {badge.seriesId} (Order: {badge.orderInSeries || 0})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 text-sm text-secondary-600">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="font-medium">Created:</span>{' '}
            {new Date(badge.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Updated:</span>{' '}
            {new Date(badge.updatedAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">ID:</span> {badge.id}
          </div>
        </div>
      </div>
    </div>
  );
};
