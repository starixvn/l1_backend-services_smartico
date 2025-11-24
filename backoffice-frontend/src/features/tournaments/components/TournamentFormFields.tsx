import React from 'react';
import { type UseFormRegister, type FieldErrors, type Control, useWatch } from 'react-hook-form';
import { TournamentType, ScoringType } from '../../../services/api.types';
import type { TournamentFormData } from '../schemas/tournamentSchema';
import { DateRangePicker } from './DateRangePicker';
import { PrizePoolConfig } from './PrizePoolConfig';

interface TournamentFormFieldsProps {
  register: UseFormRegister<TournamentFormData>;
  control: Control<TournamentFormData>;
  errors: FieldErrors<TournamentFormData>;
}

/**
 * Tournament form fields component containing all input fields
 */
export const TournamentFormFields: React.FC<TournamentFormFieldsProps> = ({
  register,
  control,
  errors
}) => {
  // Watch prize pool value for PrizePoolConfig
  const prizePool = useWatch({
    control,
    name: 'prizePool',
    defaultValue: 0
  });

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <section>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Basic Information</h2>

        {/* Tournament Name */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-secondary-700 mb-2"
          >
            Tournament Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            placeholder="Enter tournament name"
            className={`
              w-full px-3 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.name ? 'border-error focus:ring-error' : 'border-secondary-300'}
            `}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-secondary-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Optional description"
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.description ? 'border-error focus:ring-error' : 'border-secondary-300'}
            `}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error">{errors.description.message}</p>
          )}
        </div>

        {/* Tournament Type & Scoring Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Tournament Type <span className="text-error">*</span>
            </label>
            <select
              id="type"
              {...register('type')}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.type ? 'border-error focus:ring-error' : 'border-secondary-300'}
              `}
            >
              <option value="">Select type</option>
              <option value={TournamentType.LEADERBOARD}>Leaderboard</option>
              <option value={TournamentType.BRACKET}>Bracket</option>
              <option value={TournamentType.TIME_BASED_CHALLENGE}>Time Based Challenge</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-error">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="scoringType"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Scoring Type <span className="text-error">*</span>
            </label>
            <select
              id="scoringType"
              {...register('scoringType')}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.scoringType ? 'border-error focus:ring-error' : 'border-secondary-300'}
              `}
            >
              <option value="">Select scoring type</option>
              <option value={ScoringType.POINTS}>Points</option>
              <option value={ScoringType.HIGHEST_WIN}>Highest Win</option>
              <option value={ScoringType.MOST_WINS}>Most Wins</option>
              <option value={ScoringType.WAGERING_VOLUME}>Wagering Volume</option>
            </select>
            {errors.scoringType && (
              <p className="mt-1 text-sm text-error">{errors.scoringType.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Schedule</h2>
        <DateRangePicker register={register} errors={errors} />
      </section>

      {/* Prize Configuration Section */}
      <section>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Prize Configuration</h2>

        {/* Prize Pool */}
        <div className="mb-6">
          <label
            htmlFor="prizePool"
            className="block text-sm font-medium text-secondary-700 mb-2"
          >
            Total Prize Pool <span className="text-error">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-secondary-500">$</span>
            <input
              type="number"
              id="prizePool"
              step="0.01"
              {...register('prizePool', { valueAsNumber: true })}
              placeholder="0.00"
              className={`
                w-full pl-8 pr-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.prizePool ? 'border-error focus:ring-error' : 'border-secondary-300'}
              `}
            />
          </div>
          {errors.prizePool && (
            <p className="mt-1 text-sm text-error">{errors.prizePool.message}</p>
          )}
        </div>

        {/* Prize Distribution */}
        <PrizePoolConfig
          register={register}
          control={control}
          errors={errors}
          prizePool={prizePool || 0}
        />
      </section>

      {/* Optional Settings Section */}
      <section>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Optional Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Participants */}
          <div>
            <label
              htmlFor="maxParticipants"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Maximum Participants
            </label>
            <input
              type="number"
              id="maxParticipants"
              {...register('maxParticipants', { valueAsNumber: true })}
              placeholder="Unlimited"
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${errors.maxParticipants ? 'border-error focus:ring-error' : 'border-secondary-300'}
              `}
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-error">{errors.maxParticipants.message}</p>
            )}
          </div>

          {/* Entry Fee */}
          <div>
            <label
              htmlFor="entryFee"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Entry Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-secondary-500">$</span>
              <input
                type="number"
                id="entryFee"
                step="0.01"
                {...register('entryFee', { valueAsNumber: true })}
                placeholder="0.00"
                className={`
                  w-full pl-8 pr-3 py-2 border rounded-lg
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.entryFee ? 'border-error focus:ring-error' : 'border-secondary-300'}
                `}
              />
            </div>
            {errors.entryFee && (
              <p className="mt-1 text-sm text-error">{errors.entryFee.message}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
