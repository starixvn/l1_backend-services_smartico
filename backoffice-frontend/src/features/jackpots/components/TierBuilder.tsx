import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { JackpotTriggerType, JackpotTimeInterval, JackpotType } from '../../../services/api.types';
import type { JackpotFormData } from '../schemas/jackpotSchema';

interface TierBuilderProps {
  form: UseFormReturn<JackpotFormData, any, any>;
}

const STANDARD_TIERS = [
  { name: 'Mini', displayOrder: 0 },
  { name: 'Minor', displayOrder: 1 },
  { name: 'Major', displayOrder: 2 },
  { name: 'Grand', displayOrder: 3 }
];

/**
 * Component for building jackpot tiers
 */
export const TierBuilder: React.FC<TierBuilderProps> = ({ form }) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const tiers = watch('tiers') || [];
  const jackpotType = watch('type');

  const addTier = () => {
    const newTier = {
      tierId: crypto.randomUUID(),
      tierName: '',
      seedAmount: 0,
      contributionRate: 0,
      currentValue: 0,
      triggerCondition: {
        triggerType: JackpotTriggerType.RANDOM,
        probability: 0.0001
      },
      displayOrder: tiers.length
    };
    setValue('tiers', [...tiers, newTier]);
  };

  const addStandardTiers = () => {
    const standardTiers = STANDARD_TIERS.map((tier) => ({
      tierId: crypto.randomUUID(),
      tierName: tier.name,
      seedAmount: tier.name === 'Grand' ? 10000 : tier.name === 'Major' ? 1000 : tier.name === 'Minor' ? 100 : 10,
      contributionRate: jackpotType === JackpotType.PROGRESSIVE ? 0.001 : 0,
      currentValue: tier.name === 'Grand' ? 10000 : tier.name === 'Major' ? 1000 : tier.name === 'Minor' ? 100 : 10,
      triggerCondition: {
        triggerType: JackpotTriggerType.RANDOM,
        probability: tier.name === 'Grand' ? 0.0001 : tier.name === 'Major' ? 0.001 : tier.name === 'Minor' ? 0.01 : 0.1
      },
      displayOrder: tier.displayOrder
    }));
    setValue('tiers', standardTiers);
  };

  const removeTier = (index: number) => {
    const updatedTiers = tiers.filter((_, i) => i !== index);
    setValue('tiers', updatedTiers);
  };

  const getTierErrors = (index: number) => {
    return errors.tiers?.[index];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-secondary-900">Jackpot Tiers</h3>
        <div className="flex gap-2">
          {tiers.length === 0 && (
            <button
              type="button"
              onClick={addStandardTiers}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
            >
              Add Standard Tiers (Mini/Minor/Major/Grand)
            </button>
          )}
          <button
            type="button"
            onClick={addTier}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            + Add Tier
          </button>
        </div>
      </div>

      {errors.tiers && typeof errors.tiers.message === 'string' && (
        <p className="text-sm text-error">{errors.tiers.message}</p>
      )}

      {tiers.length === 0 && (
        <div className="text-center py-8 bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-300">
          <p className="text-secondary-500">No tiers configured. Add at least one tier.</p>
        </div>
      )}

      <div className="space-y-6">
        {tiers.map((tier, index) => (
          <div
            key={tier.tierId || index}
            className="p-4 bg-secondary-50 rounded-lg border border-secondary-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-secondary-900">
                Tier {index + 1}: {tier.tierName || '(Unnamed)'}
              </h4>
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="text-error hover:text-error/80"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier Name */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Tier Name *
                </label>
                <input
                  {...register(`tiers.${index}.tierName`)}
                  type="text"
                  placeholder="e.g., Grand, Major, Mini"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {getTierErrors(index)?.tierName && (
                  <p className="mt-1 text-sm text-error">{getTierErrors(index)?.tierName?.message}</p>
                )}
              </div>

              {/* Seed Amount */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Seed Amount *
                </label>
                <input
                  {...register(`tiers.${index}.seedAmount`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Initial jackpot value"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {getTierErrors(index)?.seedAmount && (
                  <p className="mt-1 text-sm text-error">{getTierErrors(index)?.seedAmount?.message}</p>
                )}
              </div>

              {/* Contribution Rate (Progressive only) */}
              {jackpotType === JackpotType.PROGRESSIVE && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Contribution Rate (%) *
                  </label>
                  <input
                    {...register(`tiers.${index}.contributionRate`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 0.5 for 0.5%"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-secondary-500">
                    Percentage of each bet that contributes (e.g., 0.5 = 0.5%)
                  </p>
                  {getTierErrors(index)?.contributionRate && (
                    <p className="mt-1 text-sm text-error">{getTierErrors(index)?.contributionRate?.message}</p>
                  )}
                </div>
              )}

              {/* Max Value */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Value (Cap)
                </label>
                <input
                  {...register(`tiers.${index}.maxValue`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional cap"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Leave empty for no cap
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Display Order
                </label>
                <input
                  {...register(`tiers.${index}.displayOrder`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Higher values show first (Grand=3, Major=2, etc.)
                </p>
              </div>
            </div>

            {/* Trigger Condition */}
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <h5 className="text-sm font-medium text-secondary-700 mb-3">Trigger Condition</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Trigger Type *
                  </label>
                  <select
                    {...register(`tiers.${index}.triggerCondition.triggerType`)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={JackpotTriggerType.RANDOM}>Random Chance</option>
                    <option value={JackpotTriggerType.VALUE_BASED}>Value-Based (Bet Threshold)</option>
                    <option value={JackpotTriggerType.TIME_BASED}>Time-Based (Must Drop)</option>
                    <option value={JackpotTriggerType.AMOUNT_BASED}>Amount-Based (Must Drop at Value)</option>
                  </select>
                </div>

                {/* Random Trigger - Probability */}
                {tier.triggerCondition?.triggerType === JackpotTriggerType.RANDOM && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Probability *
                    </label>
                    <input
                      {...register(`tiers.${index}.triggerCondition.probability`, { valueAsNumber: true })}
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      max="0.1"
                      placeholder="e.g., 0.0001 for 0.01%"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-secondary-500">
                      Decimal probability (0.0001 = 0.01% chance per bet)
                    </p>
                  </div>
                )}

                {/* Value-Based Trigger - Bet Threshold */}
                {tier.triggerCondition?.triggerType === JackpotTriggerType.VALUE_BASED && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Bet Threshold *
                    </label>
                    <input
                      {...register(`tiers.${index}.triggerCondition.betThreshold`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Minimum bet to qualify"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-secondary-500">
                      Player must bet at least this amount to qualify
                    </p>
                  </div>
                )}

                {/* Time-Based Trigger - Interval & Time */}
                {tier.triggerCondition?.triggerType === JackpotTriggerType.TIME_BASED && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Time Interval *
                      </label>
                      <select
                        {...register(`tiers.${index}.triggerCondition.timeInterval`)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select interval...</option>
                        <option value={JackpotTimeInterval.HOURLY}>Hourly</option>
                        <option value={JackpotTimeInterval.DAILY}>Daily</option>
                        <option value={JackpotTimeInterval.WEEKLY}>Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Time of Day (UTC)
                      </label>
                      <input
                        {...register(`tiers.${index}.triggerCondition.timeOfDay`)}
                        type="time"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="mt-1 text-xs text-secondary-500">
                        When the must-drop occurs
                      </p>
                    </div>
                  </>
                )}

                {/* Amount-Based Trigger - Target Amount */}
                {tier.triggerCondition?.triggerType === JackpotTriggerType.AMOUNT_BASED && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Trigger Amount *
                    </label>
                    <input
                      {...register(`tiers.${index}.triggerCondition.triggerAmount`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 2000"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-secondary-500">
                      Jackpot will trigger when it reaches this amount
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
