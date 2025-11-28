import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bonusApi } from '../../../services/bonusApi';
import type { UpdateOperatorLimitsDto } from '../../../services/bonusApi';
import type { OperatorBonusLimits } from '../../../services/api.types';

/**
 * Global Limits Settings Page
 * Allows operators to configure global bonus limits that apply across all bonuses.
 */
export function GlobalLimitsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [limits, setLimits] = useState<UpdateOperatorLimitsDto>({
    maxDailyBonusValuePerPlayer: null,
    maxWeeklyBonusValuePerPlayer: null,
    maxMonthlyBonusValuePerPlayer: null,
    maxActiveBonusesPerPlayer: null,
    currency: 'USD'
  });

  // Original limits for comparison
  const [originalLimits, setOriginalLimits] = useState<OperatorBonusLimits | null>(null);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bonusApi.getGlobalLimits();
      setOriginalLimits(data);
      setLimits({
        maxDailyBonusValuePerPlayer: data.maxDailyBonusValuePerPlayer ?? null,
        maxWeeklyBonusValuePerPlayer: data.maxWeeklyBonusValuePerPlayer ?? null,
        maxMonthlyBonusValuePerPlayer: data.maxMonthlyBonusValuePerPlayer ?? null,
        maxActiveBonusesPerPlayer: data.maxActiveBonusesPerPlayer ?? null,
        currency: data.currency || 'USD'
      });
    } catch (err) {
      setError('Failed to load global limits');
      console.error('Error loading global limits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate
      const validationError = validateLimits(limits);
      if (validationError) {
        setError(validationError);
        setSaving(false);
        return;
      }

      await bonusApi.updateGlobalLimits(limits);
      setSuccess('Global limits saved successfully!');

      // Reload to get updated timestamps
      await loadLimits();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save global limits');
      console.error('Error saving global limits:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all limits to unlimited? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await bonusApi.deleteGlobalLimits();
      setSuccess('Global limits reset to unlimited');

      // Reset form
      setLimits({
        maxDailyBonusValuePerPlayer: null,
        maxWeeklyBonusValuePerPlayer: null,
        maxMonthlyBonusValuePerPlayer: null,
        maxActiveBonusesPerPlayer: null,
        currency: 'USD'
      });
      setOriginalLimits(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset global limits');
      console.error('Error resetting global limits:', err);
    } finally {
      setSaving(false);
    }
  };

  const validateLimits = (dto: UpdateOperatorLimitsDto): string | null => {
    // Check positive values
    if (dto.maxDailyBonusValuePerPlayer !== null && dto.maxDailyBonusValuePerPlayer !== undefined && dto.maxDailyBonusValuePerPlayer <= 0) {
      return 'Max daily bonus value must be greater than 0';
    }
    if (dto.maxWeeklyBonusValuePerPlayer !== null && dto.maxWeeklyBonusValuePerPlayer !== undefined && dto.maxWeeklyBonusValuePerPlayer <= 0) {
      return 'Max weekly bonus value must be greater than 0';
    }
    if (dto.maxMonthlyBonusValuePerPlayer !== null && dto.maxMonthlyBonusValuePerPlayer !== undefined && dto.maxMonthlyBonusValuePerPlayer <= 0) {
      return 'Max monthly bonus value must be greater than 0';
    }
    if (dto.maxActiveBonusesPerPlayer !== null && dto.maxActiveBonusesPerPlayer !== undefined && dto.maxActiveBonusesPerPlayer <= 0) {
      return 'Max active bonuses must be greater than 0';
    }

    // Check hierarchy: daily <= weekly <= monthly
    const daily = dto.maxDailyBonusValuePerPlayer;
    const weekly = dto.maxWeeklyBonusValuePerPlayer;
    const monthly = dto.maxMonthlyBonusValuePerPlayer;

    if (daily && weekly && daily > weekly) {
      return 'Max daily bonus value cannot exceed max weekly bonus value';
    }
    if (weekly && monthly && weekly > monthly) {
      return 'Max weekly bonus value cannot exceed max monthly bonus value';
    }

    // Check currency
    if (!dto.currency || dto.currency.length !== 3) {
      return 'Currency must be a 3-letter code (e.g., USD, EUR)';
    }

    return null;
  };

  const handleNumberChange = (field: keyof UpdateOperatorLimitsDto, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setLimits(prev => ({ ...prev, [field]: numValue }));
  };

  const handleIntChange = (field: keyof UpdateOperatorLimitsDto, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    setLimits(prev => ({ ...prev, [field]: numValue }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/bonuses')}
            className="flex items-center text-secondary-600 hover:text-secondary-900 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bonuses
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">Global Bonus Limits</h1>
          <p className="text-secondary-600 mt-1">
            Configure operator-wide limits that apply across all bonuses
          </p>
        </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Global Limits</h3>
            <p className="mt-1 text-sm text-blue-700">
              These limits apply across ALL bonuses for your operator. For example, if you set a daily limit of $100,
              a player can claim Bonus A ($30) + Bonus B ($50) + Bonus C ($20) = $100, but no more bonuses that day.
              Leave a field empty for unlimited.
            </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-sm">
        <div className="p-6 space-y-6">
          {/* Currency */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Currency
            </label>
            <input
              type="text"
              value={limits.currency}
              onChange={(e) => setLimits(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
              maxLength={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
              placeholder="USD"
            />
            <p className="mt-1 text-xs text-secondary-500">3-letter currency code (e.g., USD, EUR, GBP)</p>
          </div>

          <hr className="border-secondary-200" />

          {/* Value Limits */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Value Limits Per Player</h3>
            <div className="space-y-4">
              {/* Daily Limit */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Daily Bonus Value
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2 text-secondary-500">{limits.currency}</span>
                  <input
                    type="number"
                    value={limits.maxDailyBonusValuePerPlayer ?? ''}
                    onChange={(e) => handleNumberChange('maxDailyBonusValuePerPlayer', e.target.value)}
                    className="w-full pl-14 pr-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Unlimited"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Weekly Limit */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Weekly Bonus Value
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2 text-secondary-500">{limits.currency}</span>
                  <input
                    type="number"
                    value={limits.maxWeeklyBonusValuePerPlayer ?? ''}
                    onChange={(e) => handleNumberChange('maxWeeklyBonusValuePerPlayer', e.target.value)}
                    className="w-full pl-14 pr-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Unlimited"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Monthly Limit */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Monthly Bonus Value
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2 text-secondary-500">{limits.currency}</span>
                  <input
                    type="number"
                    value={limits.maxMonthlyBonusValuePerPlayer ?? ''}
                    onChange={(e) => handleNumberChange('maxMonthlyBonusValuePerPlayer', e.target.value)}
                    className="w-full pl-14 pr-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Unlimited"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-secondary-200" />

          {/* Count Limits */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Bonus Count Limits</h3>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Max Active Bonuses Per Player
              </label>
              <input
                type="number"
                value={limits.maxActiveBonusesPerPlayer ?? ''}
                onChange={(e) => handleIntChange('maxActiveBonusesPerPlayer', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Unlimited"
                min="1"
                step="1"
              />
              <p className="mt-1 text-xs text-secondary-500">
                Maximum number of bonuses a player can have active at the same time
              </p>
            </div>
          </div>

          {/* Last Updated */}
          {originalLimits?.updatedAt && (
            <div className="text-sm text-secondary-500">
              Last updated: {new Date(originalLimits.updatedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 rounded-b-xl flex justify-between">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50"
          >
            Reset to Unlimited
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/bonuses')}
              className="px-4 py-2 text-secondary-600 hover:text-secondary-900 border border-secondary-300 rounded-lg hover:bg-secondary-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
