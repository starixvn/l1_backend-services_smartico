import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { bonusApi } from '../../../services/bonusApi';
import {
  BonusType,
  BonusCalculationType,
  type CreateBonusCommand,
  type TieredCalculation
} from '../../../services/api.types';
import { TieredCalculationBuilder, generateTieredFormulaString } from '../components/TieredCalculationBuilder';

const bonusTypeOptions = [
  { value: BonusType.FREE_SPINS, label: 'Free Spins', icon: '🎰', description: 'Award free spins on games' },
  { value: BonusType.CASH, label: 'Cash', icon: '💵', description: 'Award bonus cash/credit' },
  { value: BonusType.POINTS, label: 'Points', icon: '⭐', description: 'Award loyalty points' }
];

type FormData = CreateBonusCommand;

export const CreateBonusPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      type: BonusType.CASH,
      freeSpins: { numberOfSpins: 50, spinValue: 0.10 },
      cash: { amount: 50 },
      points: { amount: 100 },
      calculationRule: { calculationType: BonusCalculationType.FIXED },
      limits: {
        approval: { autoApprove: true }
      },
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  const bonusType = watch('type');
  const calculationType = watch('calculationRule.calculationType');

  const [tieredCalculation, setTieredCalculation] = useState<TieredCalculation>({
    basedOn: 'deposit_amount',
    tiers: [],
    defaultValue: 0
  });

  useEffect(() => {
    if (isEdit && id) {
      loadBonus(id);
    }
  }, [id, isEdit]);

  const loadBonus = async (bonusId: string) => {
    try {
      setIsLoading(true);
      const bonus = await bonusApi.getBonusById(bonusId);
      reset({
        ...bonus,
        startDate: bonus.startDate.split('T')[0],
        endDate: bonus.endDate.split('T')[0]
      });

      // Load tiered calculation if present
      if (bonus.calculationRule?.tieredCalculation) {
        setTieredCalculation(bonus.calculationRule.tieredCalculation);
      }
    } catch (err) {
      console.error('Failed to load bonus:', err);
      setError('Failed to load bonus. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Map frontend basedOn to backend enum values
  const mapBasedOnToBackend = (basedOn: string): string => {
    const mapping: Record<string, string> = {
      'deposit_amount': 'Deposits',
      'total_bets': 'Bets',
      'total_wins': 'Wins',
      'total_losses': 'Losses',
      'player_level': 'Deposits' // fallback
    };
    return mapping[basedOn] || 'Deposits';
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const cleanedData = { ...data };

      // Only include relevant type config
      if (data.type !== BonusType.FREE_SPINS) delete cleanedData.freeSpins;
      if (data.type !== BonusType.CASH) delete cleanedData.cash;
      if (data.type !== BonusType.POINTS) delete cleanedData.points;

      cleanedData.startDate = new Date(data.startDate).toISOString();
      cleanedData.endDate = new Date(data.endDate).toISOString();

      // Map tieredCalculation.basedOn to backend's calculationRule.basedOn
      if (cleanedData.calculationRule?.calculationType === BonusCalculationType.DYNAMIC &&
          cleanedData.calculationRule?.tieredCalculation?.basedOn) {
        cleanedData.calculationRule.basedOn = mapBasedOnToBackend(cleanedData.calculationRule.tieredCalculation.basedOn);
      }

      if (isEdit && id) {
        await bonusApi.updateBonus(id, cleanedData);
      } else {
        await bonusApi.createBonus(cleanedData);
      }

      navigate('/bonuses');
    } catch (err) {
      console.error('Failed to save bonus:', err);
      setError(err instanceof Error ? err.message : 'Failed to save bonus.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/bonuses')}
            className="flex items-center text-secondary-600 hover:text-secondary-900 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bonuses
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">
            {isEdit ? 'Edit Bonus' : 'Create Bonus'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Name *</label>
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Welcome Bonus"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg"
                  placeholder="Optional description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    {...register('startDate', { required: true })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    {...register('endDate', { required: true })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Award Type */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Award Type</h2>
            <div className="grid grid-cols-3 gap-4">
              {bonusTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    bonusType === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <input type="radio" {...register('type')} value={option.value} className="sr-only" />
                  <span className="text-3xl mb-2">{option.icon}</span>
                  <span className="text-sm font-semibold text-secondary-900">{option.label}</span>
                  <span className="text-xs text-secondary-500 text-center mt-1">{option.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Award Configuration - combines type config and calculation */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              {bonusTypeOptions.find(o => o.value === bonusType)?.label} Award
            </h2>

            {/* Calculation Type Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Calculation Method</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  calculationType === BonusCalculationType.FIXED ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-secondary-300'
                }`}>
                  <input type="radio" {...register('calculationRule.calculationType')} value={BonusCalculationType.FIXED} className="sr-only" />
                  <span className="text-sm font-semibold text-secondary-900">Fixed Amount</span>
                  <span className="text-xs text-secondary-500 mt-1">Same reward for everyone</span>
                </label>
                <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  calculationType === BonusCalculationType.DYNAMIC ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:border-secondary-300'
                }`}>
                  <input type="radio" {...register('calculationRule.calculationType')} value={BonusCalculationType.DYNAMIC} className="sr-only" />
                  <span className="text-sm font-semibold text-secondary-900">Tiered</span>
                  <span className="text-xs text-secondary-500 mt-1">Varies based on player activity</span>
                </label>
              </div>
            </div>

            {/* Fixed Amount Configuration */}
            {calculationType === BonusCalculationType.FIXED && (
              <div className="pt-4 border-t border-secondary-200">
                {bonusType === BonusType.FREE_SPINS && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Number of Spins *</label>
                      <input
                        type="number"
                        {...register('freeSpins.numberOfSpins', { valueAsNumber: true, required: true, min: 1 })}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Spin Value ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('freeSpins.spinValue', { valueAsNumber: true, required: true, min: 0.01 })}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="0.10"
                      />
                    </div>
                  </div>
                )}

                {bonusType === BonusType.CASH && (
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('cash.amount', { valueAsNumber: true, required: true, min: 0.01 })}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="50.00"
                    />
                  </div>
                )}

                {bonusType === BonusType.POINTS && (
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Points *</label>
                    <input
                      type="number"
                      {...register('points.amount', { valueAsNumber: true, required: true, min: 1 })}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tiered Calculation Configuration */}
            {calculationType === BonusCalculationType.DYNAMIC && (
              <div className="pt-4 border-t border-secondary-200">
                {bonusType === BonusType.FREE_SPINS && (
                  <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-secondary-600 mb-3">
                      The tier percentage will determine the <strong>number of spins</strong>. Configure spin value below:
                    </p>
                    <div className="max-w-xs">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Spin Value ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('freeSpins.spinValue', { valueAsNumber: true, required: true, min: 0.01 })}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="0.10"
                      />
                    </div>
                  </div>
                )}
                <TieredCalculationBuilder
                  value={tieredCalculation}
                  onChange={(calc) => {
                    setTieredCalculation(calc);
                    setValue('calculationRule.tieredCalculation', calc);
                    setValue('calculationRule.formula', generateTieredFormulaString(calc));
                  }}
                  bonusType={bonusType}
                />
              </div>
            )}
          </div>

          {/* Limits & Approval */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Limits & Approval</h2>

            {/* Bonus Amount Limits */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Bonus Amount Limits</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Minimum</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('limits.amountLimits.minAmount', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="No minimum"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Maximum (CAP)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('limits.amountLimits.maxAmount', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="No cap"
                  />
                </div>
              </div>
            </div>

            {/* Claim Limits */}
            <div className="mb-6 pt-4 border-t border-secondary-200">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Claim Limits</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Max Total Claims</label>
                  <input
                    type="number"
                    {...register('limits.maxTotalClaims', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Max Per Player</label>
                  <input
                    type="number"
                    {...register('limits.maxClaimsPerPlayer', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Approval Settings */}
            <div className="pt-4 border-t border-secondary-200">
              <label className="block text-sm font-medium text-secondary-700 mb-3">Approval</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('limits.approval.autoApprove')}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">Auto-approve all claims</span>
                </label>

                {!watch('limits.approval.autoApprove') && (
                  <div className="ml-7 p-3 bg-secondary-50 rounded-lg">
                    <label className="block text-xs text-secondary-600 mb-2">
                      Auto-approve only when bonus amount is below:
                    </label>
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="text-secondary-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('limits.approval.autoApproveThreshold', { valueAsNumber: true })}
                        className="w-full px-3 py-1.5 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 100"
                      />
                    </div>
                    <p className="text-xs text-secondary-400 mt-2">
                      Bonuses above this amount will require manual approval
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={() => navigate('/bonuses')} className="px-6 py-2.5 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {isEdit ? 'Update Bonus' : 'Create Bonus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
