import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jackpotApi } from '../../../services/jackpotApi';
import type { Jackpot, UpdateJackpotCommand } from '../../../services/api.types';
import { JackpotForm } from '../components/JackpotForm';
import type { JackpotFormData } from '../schemas/jackpotSchema';

/**
 * Edit jackpot page - only available for draft jackpots
 */
export const EditJackpotPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadJackpot();
    }
  }, [id]);

  const loadJackpot = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jackpotApi.getJackpotById(id!);

      // Only draft jackpots can be edited
      if (data.status !== 'Draft') {
        setError('Only draft jackpots can be edited');
        return;
      }

      setJackpot(data);
    } catch (err) {
      console.error('Error loading jackpot:', err);
      setError('Failed to load jackpot');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: JackpotFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const command: UpdateJackpotCommand = {
        name: data.name,
        description: data.description,
        type: data.type,
        tiers: data.tiers.map((tier, index) => ({
          tierId: tier.tierId || crypto.randomUUID(),
          tierName: tier.tierName,
          seedAmount: tier.seedAmount,
          contributionRate: tier.contributionRate,
          maxValue: tier.maxValue,
          displayOrder: tier.displayOrder ?? index,
          triggerCondition: {
            triggerType: tier.triggerCondition.triggerType,
            probability: tier.triggerCondition.probability,
            betThreshold: tier.triggerCondition.betThreshold,
            timeInterval: tier.triggerCondition.timeInterval,
            timeOfDay: tier.triggerCondition.timeOfDay,
            triggerAmount: tier.triggerCondition.triggerAmount
          }
        })),
        eligibleGames: data.eligibleGames || [],
        prizeDistribution: {
          distributionType: data.prizeDistribution.distributionType,
          maxWinners: data.prizeDistribution.maxWinners,
          winnerPercentages: data.prizeDistribution.winnerPercentages,
          minimumWagerToQualify: data.prizeDistribution.minimumWagerToQualify,
          maxPercentagePerPlayer: data.prizeDistribution.maxPercentagePerPlayer
        },
        resetBehavior: data.resetBehavior,
        currency: data.currency,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined
      };

      await jackpotApi.updateJackpot(id, command);
      navigate(`/jackpots/${id}`);
    } catch (err) {
      console.error('Error updating jackpot:', err);
      setError('Failed to update jackpot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapJackpotToFormData = (jp: Jackpot): Partial<JackpotFormData> => {
    return {
      name: jp.name,
      description: jp.description,
      type: jp.type,
      tiers: jp.tiers.map(tier => ({
        tierId: tier.tierId,
        tierName: tier.tierName,
        seedAmount: tier.seedAmount,
        contributionRate: tier.contributionRate,
        maxValue: tier.maxValue,
        displayOrder: tier.displayOrder,
        triggerCondition: {
          triggerType: tier.triggerCondition.triggerType,
          probability: tier.triggerCondition.probability,
          betThreshold: tier.triggerCondition.betThreshold,
          timeInterval: tier.triggerCondition.timeInterval,
          timeOfDay: tier.triggerCondition.timeOfDay,
          triggerAmount: tier.triggerCondition.triggerAmount
        }
      })),
      eligibleGames: jp.eligibleGames,
      prizeDistribution: {
        distributionType: jp.prizeDistribution.distributionType,
        maxWinners: jp.prizeDistribution.maxWinners,
        winnerPercentages: jp.prizeDistribution.winnerPercentages,
        minimumWagerToQualify: jp.prizeDistribution.minimumWagerToQualify,
        maxPercentagePerPlayer: jp.prizeDistribution.maxPercentagePerPlayer
      },
      resetBehavior: jp.resetBehavior,
      currency: jp.currency,
      startDate: jp.startDate ? new Date(jp.startDate).toISOString().slice(0, 16) : undefined,
      endDate: jp.endDate ? new Date(jp.endDate).toISOString().slice(0, 16) : undefined
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-1/4" />
          <div className="h-4 bg-secondary-200 rounded w-1/2" />
          <div className="bg-white p-6 rounded-lg border border-secondary-200">
            <div className="h-64 bg-secondary-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !jackpot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-error mb-4">{error}</p>
          <Link
            to="/jackpots"
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Jackpots
          </Link>
        </div>
      </div>
    );
  }

  if (!jackpot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-secondary-600">Jackpot not found</p>
          <Link
            to="/jackpots"
            className="text-primary-600 hover:text-primary-700 mt-4 inline-block"
          >
            Back to Jackpots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/jackpots/${id}`}
            className="text-secondary-500 hover:text-secondary-700"
          >
            ← Back to Jackpot
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900">Edit Jackpot</h1>
        <p className="text-secondary-600 mt-1">
          Update jackpot configuration. Only draft jackpots can be edited.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Form */}
      <JackpotForm
        initialData={mapJackpotToFormData(jackpot)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
