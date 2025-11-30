import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { JackpotForm } from '../components/JackpotForm';
import { jackpotApi } from '../../../services/jackpotApi';
import type { JackpotFormData } from '../schemas/jackpotSchema';
import type { CreateJackpotCommand } from '../../../services/api.types';

/**
 * Create jackpot page
 */
export const CreateJackpotPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: JackpotFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Map form data to command
      const command: CreateJackpotCommand = {
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        tiers: data.tiers.map(tier => ({
          tierId: tier.tierId || crypto.randomUUID(),
          tierName: tier.tierName,
          seedAmount: tier.seedAmount,
          contributionRate: tier.contributionRate,
          maxValue: tier.maxValue || undefined,
          currentValue: tier.seedAmount,
          triggerCondition: {
            triggerType: tier.triggerCondition.triggerType,
            probability: tier.triggerCondition.probability || undefined,
            betThreshold: tier.triggerCondition.betThreshold || undefined,
            timeInterval: tier.triggerCondition.timeInterval || undefined,
            timeOfDay: tier.triggerCondition.timeOfDay || undefined,
            triggerAmount: tier.triggerCondition.triggerAmount || undefined
          },
          displayOrder: tier.displayOrder
        })),
        eligibleGames: data.eligibleGames || [],
        prizeDistribution: {
          distributionType: data.prizeDistribution.distributionType,
          maxWinners: data.prizeDistribution.maxWinners || undefined,
          winnerPercentages: data.prizeDistribution.winnerPercentages || undefined,
          minimumWagerToQualify: data.prizeDistribution.minimumWagerToQualify || undefined,
          maxPercentagePerPlayer: data.prizeDistribution.maxPercentagePerPlayer || undefined
        },
        resetBehavior: data.resetBehavior,
        currency: data.currency,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined
      };

      const jackpot = await jackpotApi.createJackpot(command);
      navigate(`/jackpots/${jackpot.id}`);
    } catch (err) {
      console.error('Error creating jackpot:', err);
      setError('Failed to create jackpot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/jackpots"
          className="text-secondary-500 hover:text-secondary-700"
        >
          ← Back to Jackpots
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Create Jackpot</h1>
        <p className="text-secondary-600 mt-1">
          Configure a new progressive or fixed jackpot with tiers and triggers
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Form */}
      <JackpotForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};
