import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { BadgeRewardType } from '../../../services/api.types';
import type { BadgeFormData } from '../schemas/badgeSchema';

interface BadgeRewardConfigProps {
  form: UseFormReturn<BadgeFormData>;
}

const REWARD_OPTIONS = [
  { value: BadgeRewardType.NONE, label: 'No Reward' },
  { value: BadgeRewardType.XP_BOOST, label: 'XP Boost Multiplier' },
  { value: BadgeRewardType.FREE_SPINS, label: 'Free Spins' },
  { value: BadgeRewardType.CASH, label: 'Cash Reward' },
  { value: BadgeRewardType.BONUS_TEMPLATE, label: 'Bonus Template' }
];

/**
 * Component for configuring badge rewards
 */
export const BadgeRewardConfig: React.FC<BadgeRewardConfigProps> = ({ form }) => {
  const { register, watch, formState: { errors } } = form;
  const rewardType = watch('reward.type');

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="reward.type" className="block text-sm font-medium text-secondary-700 mb-1">
          Reward Type
        </label>
        <select
          id="reward.type"
          {...register('reward.type')}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {REWARD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.reward?.type && (
          <p className="mt-1 text-sm text-error">{errors.reward.type.message}</p>
        )}
      </div>

      {/* XP Boost Configuration */}
      {rewardType === BadgeRewardType.XP_BOOST && (
        <>
          <div>
            <label htmlFor="reward.value" className="block text-sm font-medium text-secondary-700 mb-1">
              XP Multiplier (1.1x - 3.0x) *
            </label>
            <input
              id="reward.value"
              type="number"
              step="0.1"
              min="1.1"
              max="3.0"
              {...register('reward.value', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 1.5"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Players will earn {rewardType === BadgeRewardType.XP_BOOST && watch('reward.value') ? `${watch('reward.value')}x` : '?x'} XP during the boost period
            </p>
            {errors.reward?.value && (
              <p className="mt-1 text-sm text-error">{errors.reward.value.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="reward.durationHours" className="block text-sm font-medium text-secondary-700 mb-1">
              Duration (hours) *
            </label>
            <input
              id="reward.durationHours"
              type="number"
              min="1"
              max="168"
              {...register('reward.durationHours', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 24"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Maximum 168 hours (1 week)
            </p>
            {errors.reward?.durationHours && (
              <p className="mt-1 text-sm text-error">{errors.reward.durationHours.message}</p>
            )}
          </div>
        </>
      )}

      {/* Free Spins Configuration */}
      {rewardType === BadgeRewardType.FREE_SPINS && (
        <>
          <div>
            <label htmlFor="reward.value" className="block text-sm font-medium text-secondary-700 mb-1">
              Number of Free Spins *
            </label>
            <input
              id="reward.value"
              type="number"
              min="1"
              {...register('reward.value', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 10"
            />
            {errors.reward?.value && (
              <p className="mt-1 text-sm text-error">{errors.reward.value.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="reward.gameId" className="block text-sm font-medium text-secondary-700 mb-1">
              Game ID (Optional)
            </label>
            <input
              id="reward.gameId"
              type="text"
              {...register('reward.gameId')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., slot_starburst"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Leave empty for any eligible game
            </p>
          </div>
        </>
      )}

      {/* Cash Configuration */}
      {rewardType === BadgeRewardType.CASH && (
        <div>
          <label htmlFor="reward.value" className="block text-sm font-medium text-secondary-700 mb-1">
            Cash Amount ($) *
          </label>
          <input
            id="reward.value"
            type="number"
            step="0.01"
            min="0.01"
            {...register('reward.value', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., 10.00"
          />
          {errors.reward?.value && (
            <p className="mt-1 text-sm text-error">{errors.reward.value.message}</p>
          )}
        </div>
      )}

      {/* Bonus Template Configuration */}
      {rewardType === BadgeRewardType.BONUS_TEMPLATE && (
        <div>
          <label htmlFor="reward.bonusTemplateId" className="block text-sm font-medium text-secondary-700 mb-1">
            Bonus Template ID *
          </label>
          <input
            id="reward.bonusTemplateId"
            type="text"
            {...register('reward.bonusTemplateId')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter bonus template ID"
          />
          <p className="mt-1 text-xs text-secondary-500">
            Reference an existing bonus template from the Bonuses module
          </p>
          {errors.reward?.bonusTemplateId && (
            <p className="mt-1 text-sm text-error">{errors.reward.bonusTemplateId.message}</p>
          )}
        </div>
      )}

      {/* Reward Description */}
      {rewardType && rewardType !== BadgeRewardType.NONE && (
        <div>
          <label htmlFor="reward.description" className="block text-sm font-medium text-secondary-700 mb-1">
            Reward Description
          </label>
          <textarea
            id="reward.description"
            {...register('reward.description')}
            rows={2}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Custom description for this reward (shown to players)"
          />
          {errors.reward?.description && (
            <p className="mt-1 text-sm text-error">{errors.reward.description.message}</p>
          )}
        </div>
      )}
    </div>
  );
};
