import React from 'react';
import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import type { TournamentFormData } from '../schemas/tournamentSchema';

interface DateRangePickerProps {
  register: UseFormRegister<TournamentFormData>;
  errors: FieldErrors<TournamentFormData>;
  startDate?: string;
  endDate?: string;
}

/**
 * Date range picker component for tournament start and end dates
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  register,
  errors,
  startDate,
  endDate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Start Date */}
      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-secondary-700 mb-2"
        >
          Start Date <span className="text-error">*</span>
        </label>
        <input
          type="datetime-local"
          id="startDate"
          {...register('startDate')}
          defaultValue={startDate}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${errors.startDate
              ? 'border-error focus:ring-error'
              : 'border-secondary-300'
            }
          `}
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-error">{errors.startDate.message}</p>
        )}
      </div>

      {/* End Date */}
      <div>
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-secondary-700 mb-2"
        >
          End Date <span className="text-error">*</span>
        </label>
        <input
          type="datetime-local"
          id="endDate"
          {...register('endDate')}
          defaultValue={endDate}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${errors.endDate
              ? 'border-error focus:ring-error'
              : 'border-secondary-300'
            }
          `}
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-error">{errors.endDate.message}</p>
        )}
      </div>
    </div>
  );
};
