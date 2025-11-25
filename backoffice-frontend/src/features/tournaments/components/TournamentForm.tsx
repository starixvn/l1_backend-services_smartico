import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tournamentFormSchema, type TournamentFormData } from '../schemas/tournamentSchema';
import { TournamentFormFields } from './TournamentFormFields';
import { PrizeType } from '../../../services/api.types';

interface TournamentFormProps {
  initialData?: Partial<TournamentFormData>;
  onSubmit: (data: TournamentFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

/**
 * Tournament form component with validation
 */
export const TournamentForm: React.FC<TournamentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Create Tournament'
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      prizePool: 0,
      prizeDistribution: [
        { fromPosition: 1, toPosition: undefined, prizeAmount: 0, prizeType: PrizeType.CASH }
      ]
    }
  });

  const handleFormSubmit = async (data: TournamentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <TournamentFormFields
        register={register}
        control={control}
        errors={errors}
      />

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-secondary-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <span>{submitButtonText}</span>
          )}
        </button>
      </div>
    </form>
  );
};
