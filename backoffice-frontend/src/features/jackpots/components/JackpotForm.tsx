import React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jackpotFormSchema, type JackpotFormData } from '../schemas/jackpotSchema';
import { JackpotType, JackpotResetBehavior, JackpotPrizeDistributionType } from '../../../services/api.types';
import { TierBuilder } from './TierBuilder';

interface JackpotFormProps {
  initialData?: Partial<JackpotFormData>;
  onSubmit: (data: JackpotFormData) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Jackpot form component for creating/editing jackpots
 */
export const JackpotForm: React.FC<JackpotFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  const form: UseFormReturn<JackpotFormData> = useForm<JackpotFormData>({
    resolver: zodResolver(jackpotFormSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      type: JackpotType.PROGRESSIVE,
      tiers: [],
      eligibleGames: [],
      prizeDistribution: {
        distributionType: JackpotPrizeDistributionType.WINNER_TAKES_ALL
      },
      resetBehavior: JackpotResetBehavior.RESET_TO_SEED,
      currency: 'USD',
      ...initialData
    }
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const prizeDistributionType = watch('prizeDistribution.distributionType');

  const handleFormSubmit = async (data: JackpotFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Jackpot Name *
            </label>
            <input
              id="name"
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Mega Millions Progressive"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-1">
              Jackpot Type *
            </label>
            <select
              id="type"
              {...register('type')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={JackpotType.PROGRESSIVE}>Progressive (Grows from contributions)</option>
              <option value={JackpotType.FIXED}>Fixed (Static prize amount)</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-error">{errors.type.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the jackpot..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-secondary-700 mb-1">
              Currency *
            </label>
            <input
              id="currency"
              {...register('currency')}
              type="text"
              maxLength={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="USD"
            />
            {errors.currency && (
              <p className="mt-1 text-sm text-error">{errors.currency.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="resetBehavior" className="block text-sm font-medium text-secondary-700 mb-1">
              Reset Behavior *
            </label>
            <select
              id="resetBehavior"
              {...register('resetBehavior')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={JackpotResetBehavior.RESET_TO_SEED}>Reset to Seed Amount</option>
              <option value={JackpotResetBehavior.RESET_TO_ZERO}>Reset to Zero</option>
              <option value={JackpotResetBehavior.KEEP_REMAINDER}>Keep Remainder</option>
            </select>
            {errors.resetBehavior && (
              <p className="mt-1 text-sm text-error">{errors.resetBehavior.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Jackpot Tiers */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <TierBuilder form={form} />
      </div>

      {/* Prize Distribution */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Prize Distribution</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prizeDistribution.distributionType" className="block text-sm font-medium text-secondary-700 mb-1">
                Distribution Type *
              </label>
              <select
                id="prizeDistribution.distributionType"
                {...register('prizeDistribution.distributionType')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={JackpotPrizeDistributionType.WINNER_TAKES_ALL}>Winner Takes All</option>
                <option value={JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS}>Split Among Winners (Fixed %)</option>
                <option value={JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER}>Proportional to Wager</option>
              </select>
              <p className="mt-1 text-xs text-secondary-500">
                {prizeDistributionType === JackpotPrizeDistributionType.WINNER_TAKES_ALL &&
                  'Single winner receives the entire jackpot prize.'}
                {prizeDistributionType === JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS &&
                  'Prize split among multiple winners using fixed percentages.'}
                {prizeDistributionType === JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER &&
                  'Prize distributed based on each player\'s wager amount. Higher bettors get larger shares.'}
              </p>
              {errors.prizeDistribution?.distributionType && (
                <p className="mt-1 text-sm text-error">{errors.prizeDistribution.distributionType.message}</p>
              )}
            </div>

            {/* Max Winners - for Split and Proportional */}
            {(prizeDistributionType === JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS ||
              prizeDistributionType === JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER) && (
              <div>
                <label htmlFor="prizeDistribution.maxWinners" className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Winners *
                </label>
                <input
                  id="prizeDistribution.maxWinners"
                  {...register('prizeDistribution.maxWinners', { valueAsNumber: true })}
                  type="number"
                  min={prizeDistributionType === JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS ? 2 : 1}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={prizeDistributionType === JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER ? 'e.g., 10' : 'e.g., 3'}
                />
                {errors.prizeDistribution?.maxWinners && (
                  <p className="mt-1 text-sm text-error">{errors.prizeDistribution.maxWinners.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Custom Percentages for Split Among Winners */}
          {prizeDistributionType === JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS && (
            <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <h3 className="text-sm font-medium text-secondary-900 mb-3">Winner Percentages</h3>
              <p className="text-xs text-secondary-500 mb-3">
                Define custom percentages for each winner position. Leave empty for equal split.
                Percentages must sum to 100%.
              </p>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Percentages (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 50, 30, 20 for 3 winners"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (!value) {
                      form.setValue('prizeDistribution.winnerPercentages', undefined);
                      return;
                    }
                    const percentages = value.split(',')
                      .map(p => parseFloat(p.trim()))
                      .filter(p => !isNaN(p));
                    form.setValue('prizeDistribution.winnerPercentages', percentages);
                  }}
                  defaultValue={initialData?.prizeDistribution?.winnerPercentages?.join(', ') || ''}
                />
                {errors.prizeDistribution?.winnerPercentages && (
                  <p className="mt-1 text-sm text-error">
                    {typeof errors.prizeDistribution.winnerPercentages.message === 'string'
                      ? errors.prizeDistribution.winnerPercentages.message
                      : 'Invalid percentages'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Proportional to Wager Options */}
          {prizeDistributionType === JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-secondary-900 mb-3">Proportional Distribution Settings</h3>
              <p className="text-xs text-secondary-500 mb-3">
                Prize is distributed based on each player's total wager. Players who bet more receive a larger share.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Minimum Wager to Qualify
                  </label>
                  <input
                    {...register('prizeDistribution.minimumWagerToQualify', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 10"
                  />
                  <p className="mt-1 text-xs text-secondary-500">
                    Minimum total wager to be eligible
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Max % Per Player
                  </label>
                  <input
                    {...register('prizeDistribution.maxPercentagePerPlayer', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 50"
                  />
                  <p className="mt-1 text-xs text-secondary-500">
                    Cap to prevent one player taking all
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Eligible Games */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Eligible Games</h2>

        <div>
          <label htmlFor="eligibleGames" className="block text-sm font-medium text-secondary-700 mb-1">
            Game IDs
          </label>
          <input
            type="text"
            placeholder="Enter game IDs separated by commas"
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            onChange={(e) => {
              const games = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
              form.setValue('eligibleGames', games);
            }}
            defaultValue={initialData?.eligibleGames?.join(', ') || ''}
          />
          <p className="mt-1 text-xs text-secondary-500">
            Comma-separated list of game IDs that contribute to this jackpot. Leave empty for all games.
          </p>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white p-6 rounded-lg border border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Schedule (Optional)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              {...register('startDate')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              {...register('endDate')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-error">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Jackpot'}
        </button>
      </div>
    </form>
  );
};
