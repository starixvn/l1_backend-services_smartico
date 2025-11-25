import React from 'react';
import { type UseFormRegister, type FieldErrors, useFieldArray, type Control } from 'react-hook-form';
import { PrizeType } from '../../../services/api.types';
import type { TournamentFormData } from '../schemas/tournamentSchema';

interface PrizePoolConfigProps {
  register: UseFormRegister<TournamentFormData>;
  control: Control<TournamentFormData>;
  errors: FieldErrors<TournamentFormData>;
  prizePool: number;
}

/**
 * Prize pool configuration component for managing prize distributions
 */
export const PrizePoolConfig: React.FC<PrizePoolConfigProps> = ({
  register,
  control,
  errors,
  prizePool
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prizeDistribution'
  });

  const handleAddPrize = () => {
    append({
      fromPosition: fields.length + 1,
      toPosition: undefined,
      prizeAmount: 0,
      prizeType: PrizeType.CASH
    });
  };

  const totalDistributed = fields.reduce((sum, _, index) => {
    const amountField = document.getElementById(`prizeDistribution.${index}.prizeAmount`) as HTMLInputElement;
    const fromPosField = document.getElementById(`prizeDistribution.${index}.fromPosition`) as HTMLInputElement;
    const toPosField = document.getElementById(`prizeDistribution.${index}.toPosition`) as HTMLInputElement;

    const amount = parseFloat(amountField?.value) || 0;
    const fromPos = parseInt(fromPosField?.value) || 1;
    const toPos = toPosField?.value ? parseInt(toPosField.value) : undefined;

    // Calculate total considering range
    const winnerCount = toPos ? (toPos - fromPos + 1) : 1;
    return sum + (amount * winnerCount);
  }, 0);

  const remaining = prizePool - totalDistributed;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-secondary-900">Prize Distribution</h3>
          <p className="text-sm text-secondary-600">Configure how prizes are distributed to winners</p>
        </div>
        <button
          type="button"
          onClick={handleAddPrize}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add Prize
        </button>
      </div>

      {/* Prize Pool Summary */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-secondary-600">Total Pool:</span>
            <span className="ml-2 font-semibold text-secondary-900">
              ${prizePool.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-secondary-600">Distributed:</span>
            <span className="ml-2 font-semibold text-secondary-900">
              ${totalDistributed.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-secondary-600">Remaining:</span>
            <span className={`ml-2 font-semibold ${remaining < 0 ? 'text-error' : 'text-success'}`}>
              ${remaining.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Prize Distribution List */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-start gap-3 p-4 border border-secondary-200 rounded-lg"
          >
            {/* From Position */}
            <div className="shrink-0 w-24">
              <label
                htmlFor={`prizeDistribution.${index}.fromPosition`}
                className="block text-xs font-medium text-secondary-700 mb-1"
              >
                From Pos
              </label>
              <input
                type="number"
                id={`prizeDistribution.${index}.fromPosition`}
                {...register(`prizeDistribution.${index}.fromPosition`, { valueAsNumber: true })}
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* To Position (Optional - for ranges) */}
            <div className="shrink-0 w-24">
              <label
                htmlFor={`prizeDistribution.${index}.toPosition`}
                className="block text-xs font-medium text-secondary-700 mb-1"
              >
                To Pos
              </label>
              <input
                type="number"
                id={`prizeDistribution.${index}.toPosition`}
                {...register(`prizeDistribution.${index}.toPosition`, {
                  setValueAs: (v) => v === '' || v === null ? undefined : Number(v)
                })}
                placeholder="Optional"
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Prize Amount */}
            <div className="grow">
              <label
                htmlFor={`prizeDistribution.${index}.prizeAmount`}
                className="block text-xs font-medium text-secondary-700 mb-1"
              >
                Prize Amount
              </label>
              <input
                type="number"
                id={`prizeDistribution.${index}.prizeAmount`}
                step="0.01"
                {...register(`prizeDistribution.${index}.prizeAmount`, { valueAsNumber: true })}
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Prize Type */}
            <div className="grow">
              <label
                htmlFor={`prizeDistribution.${index}.prizeType`}
                className="block text-xs font-medium text-secondary-700 mb-1"
              >
                Prize Type
              </label>
              <select
                id={`prizeDistribution.${index}.prizeType`}
                {...register(`prizeDistribution.${index}.prizeType`)}
                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={PrizeType.CASH}>Cash</option>
                <option value={PrizeType.FREE_SPINS}>Free Spins</option>
                <option value={PrizeType.BONUS_CREDIT}>Bonus Credit</option>
              </select>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="mt-6 px-3 py-1 text-sm text-error border border-error rounded hover:bg-error hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {errors.prizeDistribution && (
        <p className="text-sm text-error">
          {typeof errors.prizeDistribution.message === 'string'
            ? errors.prizeDistribution.message
            : 'Invalid prize distribution configuration'}
        </p>
      )}
    </div>
  );
};
