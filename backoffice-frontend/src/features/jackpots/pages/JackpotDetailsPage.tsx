import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jackpotApi } from '../../../services/jackpotApi';
import type { Jackpot, JackpotTier } from '../../../services/api.types';
import { JackpotStatus, JackpotType, JackpotTriggerType } from '../../../services/api.types';

/**
 * Jackpot details page
 */
export const JackpotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadJackpot();
    }
  }, [id]);

  const loadJackpot = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jackpotApi.getJackpotById(id!);
      setJackpot(data);
    } catch (err) {
      console.error('Error loading jackpot:', err);
      setError('Failed to load jackpot details');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!jackpot) return;
    try {
      setActionLoading(true);
      await jackpotApi.activateJackpot(jackpot.id);
      await loadJackpot();
    } catch (err) {
      console.error('Error activating jackpot:', err);
      setError('Failed to activate jackpot');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!jackpot) return;
    try {
      setActionLoading(true);
      await jackpotApi.pauseJackpot(jackpot.id);
      await loadJackpot();
    } catch (err) {
      console.error('Error pausing jackpot:', err);
      setError('Failed to pause jackpot');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!jackpot) return;
    try {
      setActionLoading(true);
      await jackpotApi.resumeJackpot(jackpot.id);
      await loadJackpot();
    } catch (err) {
      console.error('Error resuming jackpot:', err);
      setError('Failed to resume jackpot');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!jackpot) return;
    if (!confirm('Are you sure you want to archive this jackpot?')) return;
    try {
      setActionLoading(true);
      await jackpotApi.archiveJackpot(jackpot.id);
      await loadJackpot();
    } catch (err) {
      console.error('Error archiving jackpot:', err);
      setError('Failed to archive jackpot');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jackpot) return;
    if (!confirm('Are you sure you want to delete this jackpot? This action cannot be undone.')) return;
    try {
      setActionLoading(true);
      await jackpotApi.deleteJackpot(jackpot.id);
      navigate('/jackpots');
    } catch (err) {
      console.error('Error deleting jackpot:', err);
      setError('Failed to delete jackpot');
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!jackpot) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: jackpot.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = () => {
    if (!jackpot) return '';
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

  const getTriggerLabel = (tier: JackpotTier) => {
    switch (tier.triggerCondition.triggerType) {
      case JackpotTriggerType.RANDOM:
        const prob = tier.triggerCondition.probability || 0;
        return `${(prob * 100).toFixed(4)}% chance per qualifying bet`;
      case JackpotTriggerType.VALUE_BASED:
        return `Bet ${formatCurrency(tier.triggerCondition.betThreshold || 0)} or more to qualify`;
      case JackpotTriggerType.TIME_BASED:
        return `${tier.triggerCondition.timeInterval || 'Scheduled'} drop${tier.triggerCondition.timeOfDay ? ` at ${tier.triggerCondition.timeOfDay} UTC` : ''}`;
      default:
        return 'Unknown trigger type';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-secondary-200 rounded w-1/4" />
        <div className="h-4 bg-secondary-200 rounded w-1/2" />
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <div className="h-32 bg-secondary-100 rounded" />
        </div>
      </div>
    );
  }

  if (error && !jackpot) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <button
          onClick={loadJackpot}
          className="text-primary-600 hover:text-primary-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!jackpot) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Jackpot not found</p>
        <Link to="/jackpots" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Jackpots
        </Link>
      </div>
    );
  }

  const sortedTiers = [...jackpot.tiers].sort((a, b) => b.displayOrder - a.displayOrder);
  const totalCurrentValue = jackpot.tiers.reduce((sum, tier) => sum + tier.currentValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/jackpots"
          className="text-secondary-500 hover:text-secondary-700"
        >
          ← Back to Jackpots
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{jackpot.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {jackpot.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-secondary-600">
            <span className={jackpot.type === JackpotType.PROGRESSIVE ? 'text-success' : 'text-blue-600'}>
              {jackpot.type}
            </span>
            <span>|</span>
            <span>{jackpot.tiers.length} tier{jackpot.tiers.length !== 1 ? 's' : ''}</span>
            <span>|</span>
            <span>{jackpot.currency}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {jackpot.status === JackpotStatus.DRAFT && (
            <>
              <Link
                to={`/jackpots/${jackpot.id}/edit`}
                className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200"
              >
                Edit
              </Link>
              <button
                onClick={handleActivate}
                disabled={actionLoading}
                className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 disabled:opacity-50"
              >
                Activate
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-error text-white rounded-md hover:bg-error/90 disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
          {jackpot.status === JackpotStatus.ACTIVE && (
            <button
              onClick={handlePause}
              disabled={actionLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              Pause
            </button>
          )}
          {jackpot.status === JackpotStatus.PAUSED && (
            <>
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 disabled:opacity-50"
              >
                Resume
              </button>
              <button
                onClick={handleArchive}
                disabled={actionLoading}
                className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 disabled:opacity-50"
              >
                Archive
              </button>
            </>
          )}
          {jackpot.status === JackpotStatus.COMPLETED && (
            <button
              onClick={handleArchive}
              disabled={actionLoading}
              className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Total Value Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <p className="text-primary-100 text-sm mb-1">Total Jackpot Value</p>
        <p className="text-4xl font-bold">{formatCurrency(totalCurrentValue)}</p>
        {jackpot.lastWonAt && (
          <p className="text-primary-100 text-sm mt-2">
            Last won: {new Date(jackpot.lastWonAt).toLocaleString()} - {formatCurrency(jackpot.lastWinAmount || 0)}
          </p>
        )}
      </div>

      {/* Tiers */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Jackpot Tiers</h2>
        <div className="space-y-4">
          {sortedTiers.map((tier) => (
            <div
              key={tier.tierId}
              className={`p-4 rounded-lg border-2 ${getTierColor(tier.tierName)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{tier.tierName}</h3>
                <p className="text-2xl font-bold">{formatCurrency(tier.currentValue)}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="opacity-75">Seed Amount</p>
                  <p className="font-medium">{formatCurrency(tier.seedAmount)}</p>
                </div>
                {jackpot.type === JackpotType.PROGRESSIVE && (
                  <div>
                    <p className="opacity-75">Contribution Rate</p>
                    <p className="font-medium">{(tier.contributionRate * 100).toFixed(2)}%</p>
                  </div>
                )}
                {tier.maxValue && (
                  <div>
                    <p className="opacity-75">Max Value (Cap)</p>
                    <p className="font-medium">{formatCurrency(tier.maxValue)}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="opacity-75">Trigger</p>
                  <p className="font-medium">{getTriggerLabel(tier)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <p className="text-sm text-secondary-500 mb-1">Total Contributions</p>
          <p className="text-xl font-bold text-secondary-900">
            {formatCurrency(jackpot.totalContributions)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <p className="text-sm text-secondary-500 mb-1">Total Payouts</p>
          <p className="text-xl font-bold text-secondary-900">
            {formatCurrency(jackpot.totalPayouts)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <p className="text-sm text-secondary-500 mb-1">Eligible Games</p>
          <p className="text-xl font-bold text-secondary-900">
            {jackpot.eligibleGames.length || 'All Games'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <p className="text-sm text-secondary-500 mb-1">Reset Behavior</p>
          <p className="text-lg font-medium text-secondary-900">
            {jackpot.resetBehavior.replace(/([A-Z])/g, ' $1').trim()}
          </p>
        </div>
      </div>

      {/* Description */}
      {jackpot.description && (
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">Description</h2>
          <p className="text-secondary-600">{jackpot.description}</p>
        </div>
      )}

      {/* Schedule */}
      {(jackpot.startDate || jackpot.endDate) && (
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">Schedule</h2>
          <div className="flex gap-8 text-sm">
            {jackpot.startDate && (
              <div>
                <p className="text-secondary-500">Start Date</p>
                <p className="font-medium text-secondary-900">
                  {new Date(jackpot.startDate).toLocaleString()}
                </p>
              </div>
            )}
            {jackpot.endDate && (
              <div>
                <p className="text-secondary-500">End Date</p>
                <p className="font-medium text-secondary-900">
                  {new Date(jackpot.endDate).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-secondary-50 p-4 rounded-lg text-sm text-secondary-600">
        <p>Created: {new Date(jackpot.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(jackpot.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};
