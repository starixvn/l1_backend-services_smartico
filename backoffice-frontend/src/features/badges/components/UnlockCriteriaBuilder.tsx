import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { BadgeUnlockCriteriaType } from '../../../services/api.types';
import type { BadgeFormData } from '../schemas/badgeSchema';

interface UnlockCriteriaBuilderProps {
  form: UseFormReturn<BadgeFormData>;
}

const CRITERIA_OPTIONS = [
  { value: BadgeUnlockCriteriaType.MISSION_COMPLETED, label: 'Missions Completed', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.WAGER_AMOUNT, label: 'Wager Amount', requiresThreshold: true, supportsGames: true },
  { value: BadgeUnlockCriteriaType.DEPOSIT_AMOUNT, label: 'Deposit Amount', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.BET_COUNT, label: 'Bet Count', requiresThreshold: true, supportsGames: true },
  { value: BadgeUnlockCriteriaType.TOURNAMENT_WINS, label: 'Tournament Wins', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.TOURNAMENT_PARTICIPATIONS, label: 'Tournament Participations', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.LOGIN_STREAK, label: 'Login Streak (Days)', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.TOTAL_LOGINS, label: 'Total Logins', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.LEVEL_REACHED, label: 'Level Reached', requiresThreshold: true },
  { value: BadgeUnlockCriteriaType.TIER_REACHED, label: 'Tier Reached', requiresTier: true },
  { value: BadgeUnlockCriteriaType.GAME_PLAYED, label: 'Game Played (Rounds)', requiresThreshold: true, requiresGames: true },
  { value: BadgeUnlockCriteriaType.FIRST_DEPOSIT, label: 'First Deposit' },
  { value: BadgeUnlockCriteriaType.FIRST_BET, label: 'First Bet', supportsGames: true },
  { value: BadgeUnlockCriteriaType.CUSTOM, label: 'Custom Event', requiresCustomEvent: true }
];

/**
 * Component for building badge unlock criteria
 */
export const UnlockCriteriaBuilder: React.FC<UnlockCriteriaBuilderProps> = ({ form }) => {
  const { register, watch, formState: { errors } } = form;
  const criteriaType = watch('unlockCriteria.type');

  const selectedOption = CRITERIA_OPTIONS.find(opt => opt.value === criteriaType);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="unlockCriteria.type" className="block text-sm font-medium text-secondary-700 mb-1">
          Unlock Criteria Type *
        </label>
        <select
          id="unlockCriteria.type"
          {...register('unlockCriteria.type')}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select criteria type...</option>
          {CRITERIA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.unlockCriteria?.type && (
          <p className="mt-1 text-sm text-error">{errors.unlockCriteria.type.message}</p>
        )}
      </div>

      {/* Threshold Value */}
      {selectedOption?.requiresThreshold && (
        <div>
          <label htmlFor="unlockCriteria.thresholdValue" className="block text-sm font-medium text-secondary-700 mb-1">
            {criteriaType === BadgeUnlockCriteriaType.WAGER_AMOUNT || criteriaType === BadgeUnlockCriteriaType.DEPOSIT_AMOUNT
              ? 'Amount ($) *'
              : 'Target Value *'}
          </label>
          <input
            id="unlockCriteria.thresholdValue"
            type="number"
            {...register('unlockCriteria.thresholdValue', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={
              criteriaType === BadgeUnlockCriteriaType.WAGER_AMOUNT
                ? 'e.g., 10000'
                : criteriaType === BadgeUnlockCriteriaType.LOGIN_STREAK
                ? 'e.g., 7'
                : 'e.g., 100'
            }
          />
          {errors.unlockCriteria?.thresholdValue && (
            <p className="mt-1 text-sm text-error">{errors.unlockCriteria.thresholdValue.message}</p>
          )}
        </div>
      )}

      {/* Target Tier */}
      {selectedOption?.requiresTier && (
        <div>
          <label htmlFor="unlockCriteria.targetTier" className="block text-sm font-medium text-secondary-700 mb-1">
            Target Tier *
          </label>
          <input
            id="unlockCriteria.targetTier"
            type="text"
            {...register('unlockCriteria.targetTier')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Gold, Platinum, Diamond"
          />
          {errors.unlockCriteria?.targetTier && (
            <p className="mt-1 text-sm text-error">{errors.unlockCriteria.targetTier.message}</p>
          )}
        </div>
      )}

      {/* Custom Event Name */}
      {selectedOption?.requiresCustomEvent && (
        <div>
          <label htmlFor="unlockCriteria.customEventName" className="block text-sm font-medium text-secondary-700 mb-1">
            Custom Event Name *
          </label>
          <input
            id="unlockCriteria.customEventName"
            type="text"
            {...register('unlockCriteria.customEventName')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., special_promo_completed"
          />
          {errors.unlockCriteria?.customEventName && (
            <p className="mt-1 text-sm text-error">{errors.unlockCriteria.customEventName.message}</p>
          )}
        </div>
      )}

      {/* Eligible Games - required for GamePlayed, optional for Wager/Bet criteria */}
      {(selectedOption?.requiresGames || selectedOption?.supportsGames) && (
        <div>
          <label htmlFor="unlockCriteria.eligibleGames" className="block text-sm font-medium text-secondary-700 mb-1">
            Eligible Games {selectedOption?.requiresGames ? '*' : '(Optional)'}
          </label>
          <input
            id="unlockCriteria.eligibleGames"
            type="text"
            placeholder="Enter game IDs separated by commas"
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            onChange={(e) => {
              const games = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
              form.setValue('unlockCriteria.eligibleGames', games);
            }}
            defaultValue={form.getValues('unlockCriteria.eligibleGames')?.join(', ') || ''}
          />
          <p className="mt-1 text-xs text-secondary-500">
            {selectedOption?.requiresGames
              ? 'Comma-separated list of game IDs (required)'
              : 'Comma-separated list of game IDs. Leave empty for all games.'}
          </p>
          {errors.unlockCriteria?.eligibleGames && (
            <p className="mt-1 text-sm text-error">{errors.unlockCriteria.eligibleGames.message}</p>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="unlockCriteria.description" className="block text-sm font-medium text-secondary-700 mb-1">
          Criteria Description
        </label>
        <textarea
          id="unlockCriteria.description"
          {...register('unlockCriteria.description')}
          rows={2}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Custom description for this criteria (shown to players)"
        />
        {errors.unlockCriteria?.description && (
          <p className="mt-1 text-sm text-error">{errors.unlockCriteria.description.message}</p>
        )}
      </div>
    </div>
  );
};
