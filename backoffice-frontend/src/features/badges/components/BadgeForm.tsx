import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { BadgeRarity } from '../../../services/api.types';
import { UnlockCriteriaBuilder } from './UnlockCriteriaBuilder';
import { BadgeRewardConfig } from './BadgeRewardConfig';
import type { BadgeFormData } from '../schemas/badgeSchema';

interface BadgeFormProps {
  form: UseFormReturn<BadgeFormData>;
}

const RARITY_OPTIONS = [
  { value: BadgeRarity.COMMON, label: 'Common', color: 'text-secondary-600' },
  { value: BadgeRarity.RARE, label: 'Rare', color: 'text-blue-600' },
  { value: BadgeRarity.EPIC, label: 'Epic', color: 'text-purple-600' },
  { value: BadgeRarity.LEGENDARY, label: 'Legendary', color: 'text-yellow-600' }
];

/**
 * Badge form component for creating/editing badges
 */
export const BadgeForm: React.FC<BadgeFormProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Badge Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., High Roller, Tournament Champion"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name.message}</p>
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
              placeholder="Describe how to earn this badge..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="rarity" className="block text-sm font-medium text-secondary-700 mb-1">
              Rarity *
            </label>
            <select
              id="rarity"
              {...register('rarity')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select rarity...</option>
              {RARITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.rarity && (
              <p className="mt-1 text-sm text-error">{errors.rarity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="iconUrl" className="block text-sm font-medium text-secondary-700 mb-1">
              Icon URL
            </label>
            <input
              id="iconUrl"
              type="text"
              {...register('iconUrl')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://..."
            />
            {errors.iconUrl && (
              <p className="mt-1 text-sm text-error">{errors.iconUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Criteria */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Unlock Criteria</h2>
        <p className="text-sm text-secondary-600 mb-4">
          Define how players earn this badge
        </p>
        <UnlockCriteriaBuilder form={form} />
      </div>

      {/* Reward Configuration */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Reward (Optional)</h2>
        <p className="text-sm text-secondary-600 mb-4">
          Configure a reward players receive when unlocking this badge
        </p>
        <BadgeRewardConfig form={form} />
      </div>

      {/* Display Settings */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Display Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isHidden"
              type="checkbox"
              {...register('isHidden')}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isHidden" className="text-sm text-secondary-700">
              <span className="font-medium">Hidden Badge</span>
              <span className="block text-secondary-500">Players won't see criteria until unlocked (surprise badge)</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="progressTrackingEnabled"
              type="checkbox"
              {...register('progressTrackingEnabled')}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="progressTrackingEnabled" className="text-sm text-secondary-700">
              <span className="font-medium">Show Progress</span>
              <span className="block text-secondary-500">Display progress bar towards unlocking (e.g., "32/50 tournaments")</span>
            </label>
          </div>
        </div>
      </div>

      {/* Series Assignment */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Series Assignment (Optional)</h2>
        <p className="text-sm text-secondary-600 mb-4">
          Assign this badge to a collection/series
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="seriesId" className="block text-sm font-medium text-secondary-700 mb-1">
              Series ID
            </label>
            <input
              id="seriesId"
              type="text"
              {...register('seriesId')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter series ID"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Leave empty for standalone badge
            </p>
          </div>

          <div>
            <label htmlFor="orderInSeries" className="block text-sm font-medium text-secondary-700 mb-1">
              Order in Series
            </label>
            <input
              id="orderInSeries"
              type="number"
              min="0"
              {...register('orderInSeries', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
            />
            {errors.orderInSeries && (
              <p className="mt-1 text-sm text-error">{errors.orderInSeries.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
